import { GoogleGenerativeAI } from '@google/generative-ai';
import { BrowserManager } from './browserManager.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Helpers ────────────────────────────────────────────────

function safeSend(ws, data) {
  if (ws.readyState === ws.OPEN) {
    ws.send(typeof data === 'string' ? data : JSON.stringify(data));
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function stripFences(text) {
  return text
    .replace(/```(?:json)?\s*/gi, '')
    .replace(/```/g, '')
    .trim();
}

function shouldStop(ws, signal) {
  return ws.readyState !== ws.OPEN || signal.stopped;
}

// ─── CAPTCHA Detection ────────────────────────────────────

const CAPTCHA_SIGNALS = [
  "i'm not a robot", 'i am not a robot', 'prove you are human',
  'verify you are human', 'human verification', 'security check',
  'unusual traffic', 'recaptcha', 'hcaptcha', 'cloudflare',
  'access denied', 'captcha', 'please verify', 'bot detection',
  'ddos-guard', 'just a moment', 'checking your browser',
];

function isCaptchaPage(pageText, url) {
  const haystack = (pageText + ' ' + url).toLowerCase();
  return CAPTCHA_SIGNALS.some((s) => haystack.includes(s));
}

/**
 * Pauses the agent loop, alerts the frontend, then polls every 4s until the
 * CAPTCHA disappears (user solved it via the interactive browser stream).
 * Returns true when cleared, false on timeout or stop signal.
 */
async function waitForCaptchaClear(browser, ws, signal, timeoutMs = 3 * 60 * 1000) {
  const POLL_MS = 4000;
  const deadline = Date.now() + timeoutMs;

  // Send a screenshot so the user can see what they need to solve
  const snap = await browser.captureScreenshot();
  safeSend(ws, { type: 'SCREENSHOT', data: snap });
  safeSend(ws, {
    type: 'CAPTCHA',
    text: 'CAPTCHA detected — solve it using the browser stream below, then the agent will continue automatically.',
  });

  while (Date.now() < deadline) {
    if (shouldStop(ws, signal)) return false;
    await sleep(POLL_MS);

    const pageText = await browser.getPageText(2000);
    const currentUrl = browser.page.url();

    // Keep refreshing the screenshot so the user sees state changes
    const poll = await browser.captureScreenshot();
    safeSend(ws, { type: 'SCREENSHOT', data: poll });

    if (!isCaptchaPage(pageText, currentUrl)) {
      safeSend(ws, { type: 'CAPTCHA_CLEARED', text: 'CAPTCHA solved — resuming research.' });
      await sleep(1500); // brief pause so the page can finish loading
      return true;
    }
  }

  safeSend(ws, { type: 'STATUS', text: 'CAPTCHA wait timed out (3 min) — skipping this step.' });
  return false;
}

/**
 * Calls model.generateContent with automatic retry on 429 errors.
 */
async function gemini(model, content, ws, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(content);
      return result.response.text();
    } catch (err) {
      const is429 =
        err?.status === 429 ||
        err?.httpStatusCode === 429 ||
        (err?.message && err.message.includes('429'));

      if (!is429) throw err;

      // ── Parse the retry delay the API told us to use ──────────────────
      let waitSec = 60; // safe fallback

      // 1) "Please retry in 38.729312073s" in the message text
      const textMatch = err.message?.match(/retry in ([\d.]+)\s*s/i);
      if (textMatch) waitSec = Math.ceil(parseFloat(textMatch[1]));

      // 2) "retryDelay":"38s" in the embedded JSON body
      try {
        const jsonMatch = err.message?.match(/\[\{.*\}\]/s);
        if (jsonMatch) {
          const details = JSON.parse(jsonMatch[0]);
          for (const entry of details) {
            if (entry?.retryDelay) {
              const sec = parseInt(entry.retryDelay, 10);
              if (!isNaN(sec)) waitSec = Math.max(waitSec, sec);
            }
          }
        }
      } catch { /* ignore parse failures */ }

      // Add a small buffer so we don't immediately hit the limit again
      waitSec += 5;

      // If the wait is extremely long (>10 min) this is likely a daily quota
      const isDaily = waitSec > 600;
      const waitLabel = isDaily
        ? `Daily quota exhausted — waiting ${Math.round(waitSec / 60)} min (attempt ${attempt}/${maxRetries})`
        : `Rate limit — waiting ${waitSec}s (attempt ${attempt}/${maxRetries})`;

      console.warn(`⏳ 429: ${waitLabel}`);
      safeSend(ws, { type: 'RATE_LIMIT', text: waitLabel, waitSec, isDaily });

      if (attempt < maxRetries) {
        await sleep(waitSec * 1000);
        continue;
      }
      throw err;
    }
  }
}

/**
 * Ask Gemini a text-only question (no vision). Returns parsed JSON or null.
 */
async function askJSON(model, prompt, ws) {
  const raw = await gemini(model, [prompt], ws);
  try {
    return JSON.parse(stripFences(raw));
  } catch {
    console.error('Failed to parse Gemini JSON:', raw);
    return null;
  }
}

// ─── Phase 1: Task Decomposition ───────────────────────────

async function planTasks(model, userGoal, ws) {
  safeSend(ws, { type: 'PHASE', phase: 'planning', text: 'Breaking your goal into tasks…' });

  const prompt = [
    'You are a travel planning orchestrator.',
    `The user's goal is: "${userGoal}".`,
    '',
    'Break this goal into 2-4 concrete research tasks. Each task should target a DIFFERENT category.',
    'For EACH task, provide 2-3 Google search queries that would find useful results.',
    '',
    'Output ONLY valid JSON (no markdown, no explanation) in this exact format:',
    '{',
    '  "tasks": [',
    '    {',
    '      "id": 1,',
    '      "category": "flights" | "hotels" | "activities" | "transport" | "general",',
    '      "description": "Find round-trip flights from NYC to Paris in July",',
    '      "searchQueries": ["NYC to Paris flights July 2026", "cheap flights JFK CDG July"]',
    '    }',
    '  ],',
    '  "constraints": {',
    '    "budget": "<extracted budget or null>",',
    '    "dates": "<extracted dates or null>",',
    '    "travelers": "<number or null>",',
    '    "preferences": "<any stated preferences or null>"',
    '  }',
    '}',
  ].join('\n');

  const plan = await askJSON(model, prompt, ws);

  if (!plan || !plan.tasks?.length) {
    // Fallback: single generic task
    return {
      tasks: [
        {
          id: 1,
          category: 'general',
          description: userGoal,
          searchQueries: [userGoal],
        },
      ],
      constraints: {},
    };
  }

  safeSend(ws, {
    type: 'PLAN',
    tasks: plan.tasks,
    constraints: plan.constraints,
  });

  return plan;
}

// ─── Phase 2: Autonomous Web Research (per task) ───────────
//
// Strategy: text-only Gemini calls for ~90% of decisions (no image sent).
// Vision (image+text) is used ONLY when the model signals it needs to click
// a UI element and must see the screen to get pixel coordinates.
// This cuts API calls from ~180 to ~18 per full run.

const MAX_STEPS_PER_QUERY = 6;  // each step is one Gemini call
const MAX_QUERIES_PER_TASK = 1; // only use the first search query per task
const MAX_REPEAT_ACTIONS = 3;   // bail if same action type repeats this many times
const MAX_ITEMS_PER_TASK = 5;   // maximum items to extract per task (for quick demo)

// Sites that require complex form interactions — avoid navigating into them.
// The agent should extract data from Google snippets about these sites instead.
const AVOID_DEEP_NAVIGATION = [
  'booking.com', 'hotels.com', 'agoda.com', 'expedia.com',
  'makemytrip.com', 'goibibo.com', 'cleartrip.com', 'yatra.com',
  'tripadvisor.com', 'airbnb.com', 'trivago.com',
];

function shouldAvoidUrl(url) {
  return AVOID_DEEP_NAVIGATION.some((site) => url.includes(site));
}

async function researchTask(model, task, constraints, browser, ws, signal) {
  const findings = [];
  const queries = task.searchQueries.slice(0, MAX_QUERIES_PER_TASK);

  for (const query of queries) {
    if (shouldStop(ws, signal)) break;

    safeSend(ws, { type: 'TASK_STATUS', taskId: task.id, text: `Searching: "${query}"` });

    try {
      await browser.page.goto(
        `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        { waitUntil: 'domcontentloaded' }
      );
    } catch { continue; }

    await sleep(2000);
    // Show the initial search results right away
    const initialSnap = await browser.captureScreenshot();
    safeSend(ws, { type: 'SCREENSHOT', data: initialSnap });

    let lastAction = null;
    let repeatCount = 0;

    for (let step = 1; step <= MAX_STEPS_PER_QUERY; step++) {
      if (shouldStop(ws, signal)) break;

      const currentUrl = browser.page.url();

      // If we've landed on a booking/form site, go back to Google immediately
      if (shouldAvoidUrl(currentUrl)) {
        safeSend(ws, { type: 'REASONING', text: `[${task.category}] booking site detected — going back to Google` });
        try {
          await browser.page.goto(
            `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            { waitUntil: 'domcontentloaded' }
          );
        } catch { /* ignore */ }
        await sleep(2000);
        // Show user we're back on Google
        const backSnap = await browser.captureScreenshot();
        safeSend(ws, { type: 'SCREENSHOT', data: backSnap });
        continue;
      }

      const pageText = await browser.getPageText(3000);

      // ── CAPTCHA gate: pause until user solves it ──
      if (isCaptchaPage(pageText, currentUrl)) {
        const cleared = await waitForCaptchaClear(browser, ws, signal);
        if (!cleared || shouldStop(ws, signal)) break;
        continue; // re-read page state after CAPTCHA is gone
      }

      // Always send the current page state before asking the AI what to do next
      const preSnap = await browser.captureScreenshot();
      safeSend(ws, { type: 'SCREENSHOT', data: preSnap });

      // ── TEXT-ONLY decision call ──
      const textPrompt = [
        'You are a travel-research browser agent. Your job is to EXTRACT data, not fill forms.',
        `TASK: ${task.description}`,
        `CATEGORY: ${task.category}`,
        constraints.budget ? `BUDGET: ${constraints.budget}` : '',
        constraints.dates  ? `DATES: ${constraints.dates}`  : '',
        `Current URL: ${currentUrl}`,
        `Step ${step}/${MAX_STEPS_PER_QUERY}`,
        '',
        'Data collected so far:',
        findings.length ? JSON.stringify(findings.slice(-3)) : '(none yet)',
        '',
        'Page text:',
        '---',
        pageText || '(empty)',
        '---',
        '',
        'Choose the SINGLE best next action. Output ONLY valid JSON:',
        '  {"action": "extract", "data": [{"name":"...","price":"...","details":"...","url":"...","rating":"..."}]}',
        '  {"action": "scroll", "direction": "down"}',
        '  {"action": "scroll", "direction": "up"}',
        '  {"action": "goto", "url": "<google search result URL only>"}',
        '  {"action": "back"}',
        '  {"action": "next_query"}',
        '  {"action": "click_needed"}',
        '',
        'STRICT RULES — read carefully:',
        '- PRIORITY 1: If the page text contains prices, names, or ratings relevant to the task → extract immediately.',
        '- Google search result pages already contain rich data in snippets. Extract directly from them.',
        '- NEVER navigate to or type into: booking.com, hotels.com, agoda, expedia, makemytrip, goibibo, cleartrip, airbnb, tripadvisor.',
        '- NEVER use "type" or "enter" as actions. You may not fill forms.',
        '- Only use "goto" to visit a non-booking site (wikipedia, local tourism sites, government sites, news).',
        '- If you have extracted data at least once, use "next_query" to finish.',
        '- NEVER output anything except the JSON object.',
      ].filter(Boolean).join('\n');

      let action;
      try {
        const raw = await gemini(model, [textPrompt], ws);
        action = JSON.parse(stripFences(raw));
      } catch (err) {
        safeSend(ws, { type: 'STATUS', text: `Decision error: ${err.message}` });
        await sleep(10000);
        continue;
      }

      // ── Loop detection: bail if same action repeats too many times ──
      if (action.action === lastAction && action.action !== 'extract') {
        repeatCount++;
        if (repeatCount >= MAX_REPEAT_ACTIONS) {
          safeSend(ws, { type: 'REASONING', text: `[${task.category}] loop detected (${action.action} ×${repeatCount}) — skipping query` });
          break;
        }
      } else {
        repeatCount = 0;
      }
      lastAction = action.action;

      // Block type/enter in case model ignores instructions
      if (action.action === 'type' || action.action === 'enter') {
        safeSend(ws, { type: 'REASONING', text: `[${task.category}] blocked form-fill action — scrolling instead` });
        action = { action: 'scroll', direction: 'down' };
      }

      // Block navigation into avoided sites
      if (action.action === 'goto' && shouldAvoidUrl(action.url || '')) {
        safeSend(ws, { type: 'REASONING', text: `[${task.category}] blocked goto booking site — extracting from current page` });
        action = { action: 'extract', data: [] }; // force extract attempt below
      }

      // ── Vision upgrade: only when model says it needs click coordinates ──
      if (action.action === 'click_needed') {
        const base64Image = await browser.captureScreenshot();
        safeSend(ws, { type: 'SCREENSHOT', data: base64Image });
        const visionPrompt = [
          `You are clicking on a web page to research: "${task.description}".`,
          `Current URL: ${currentUrl}`,
          'Viewport is 1280×720.',
          'Output ONLY {"action":"click","x":<n>,"y":<n>} for the most relevant element.',
        ].join('\n');
        try {
          const raw = await gemini(
            model,
            [visionPrompt, { inlineData: { mimeType: 'image/jpeg', data: base64Image } }],
            ws,
          );
          action = JSON.parse(stripFences(raw));
        } catch {
          action = { action: 'scroll', direction: 'down' };
        }
      }

      // Log
      const label =
        action.action === 'click'      ? `click (${action.x},${action.y})` :
        action.action === 'goto'       ? `goto ${(action.url || '').slice(0, 60)}` :
        action.action === 'extract'    ? `extracted ${action.data?.length || 0} items` :
        action.action === 'next_query' ? 'moving to next query' :
        action.action;
      safeSend(ws, { type: 'REASONING', text: `[${task.category}] ${label}` });

      // Handle extract
      if (action.action === 'extract' && Array.isArray(action.data) && action.data.length > 0) {
        // Limit the number of items added to prevent excessive extraction
        const itemsToAdd = action.data.slice(0, MAX_ITEMS_PER_TASK - findings.length);
        if (itemsToAdd.length > 0) {
          findings.push(...itemsToAdd.map((d) => ({ ...d, source: currentUrl, category: task.category })));
          safeSend(ws, { type: 'DATA_COLLECTED', taskId: task.id, count: findings.length, latest: itemsToAdd });
        }
        
        // If we've reached the limit, stop this task
        if (findings.length >= MAX_ITEMS_PER_TASK) {
          safeSend(ws, { type: 'REASONING', text: `[${task.category}] Reached limit of ${MAX_ITEMS_PER_TASK} items — task complete` });
          break;
        }
        
        await sleep(10000);
        continue;
      }

      if (action.action === 'next_query') break;

      // Execute browser action then immediately stream the result
      try {
        await browser.executeAction({
          type: action.action,
          x: action.x, y: action.y,
          text: action.text, url: action.url,
          direction: action.direction, ms: action.ms,
        });
        // Give the page time to react (longer for navigations)
        const navActions = ['goto', 'click', 'enter', 'back'];
        await sleep(navActions.includes(action.action) ? 3000 : 800);
        // Stream post-action state so user sees what changed
        const postSnap = await browser.captureScreenshot();
        safeSend(ws, { type: 'SCREENSHOT', data: postSnap });
      } catch (err) {
        safeSend(ws, { type: 'STATUS', text: `Action failed: ${err.message}` });
      }

      // Remaining delay (total ~10s between Gemini calls — subtract time already spent)
      await sleep(7000);
    }
  }

  // Fallback: if nothing collected, extract from whatever page is loaded
  if (findings.length === 0) {
    const pageText = await browser.getPageText(3000);
    if (pageText.length > 100) {
      const fallback = await askJSON(model, [
        `Extract any travel-related data from this page text for the task: "${task.description}".`,
        'Output JSON: {"data": [{"name":"...","price":"...","details":"...","rating":"..."}]}',
        'TEXT:', pageText,
      ].join('\n'), ws);
      if (fallback?.data) {
        findings.push(...fallback.data.map((d) => ({ ...d, category: task.category })));
      }
    }
  }

  return findings;
}

// ─── Phase 3: Travel Optimization ──────────────────────────

async function optimizeResults(model, allFindings, constraints, ws) {
  safeSend(ws, { type: 'PHASE', phase: 'optimizing', text: 'Comparing and ranking options…' });

  if (allFindings.length === 0) {
    return { ranked: [], reasoning: 'No data was collected to optimize.' };
  }

  const prompt = [
    'You are a travel optimization engine. Given the raw data below, rank and recommend the best options.',
    '',
    'Constraints:',
    JSON.stringify(constraints),
    '',
    'Collected data:',
    JSON.stringify(allFindings, null, 2),
    '',
    'For each category (flights, hotels, activities, etc.) present in the data:',
    '1. Rank options by value (considering price, rating, convenience)',
    '2. Pick a "recommended" option with reasoning',
    '3. Flag any budget concerns',
    '',
    'Output ONLY valid JSON:',
    '{',
    '  "ranked": [',
    '    {',
    '      "category": "flights",',
    '      "recommended": {"name":"...", "price":"...", "reason":"..."},',
    '      "alternatives": [{"name":"...", "price":"..."}],',
    '      "budgetNote": "..."',
    '    }',
    '  ],',
    '  "totalEstimate": "$X,XXX",',
    '  "reasoning": "Brief explanation of optimization strategy"',
    '}',
  ].join('\n');

  const result = await askJSON(model, prompt, ws);
  return result || { ranked: [], reasoning: 'Optimization failed.' };
}

// ─── Phase 4: Generate Final Travel Plan ───────────────────

async function generateTravelPlan(model, userGoal, optimized, constraints, allFindings, ws) {
  safeSend(ws, { type: 'PHASE', phase: 'generating', text: 'Building your travel plan…' });

  const prompt = [
    'You are a travel plan writer. Create a complete, actionable travel plan.',
    '',
    `User goal: "${userGoal}"`,
    '',
    'Constraints:',
    JSON.stringify(constraints),
    '',
    'Optimized recommendations:',
    JSON.stringify(optimized, null, 2),
    '',
    'All raw data:',
    JSON.stringify(allFindings.slice(0, 20), null, 2),
    '',
    'Write a comprehensive travel plan in this JSON format:',
    '{',
    '  "title": "Trip to ...",',
    '  "summary": "A 2-3 sentence overview",',
    '  "estimatedBudget": "$X,XXX",',
    '  "sections": [',
    '    {',
    '      "category": "flights",',
    '      "title": "✈️ Flights",',
    '      "recommendation": "...",',
    '      "details": "...",',
    '      "estimatedCost": "$XXX",',
    '      "alternatives": ["...", "..."]',
    '    }',
    '  ],',
    '  "dailyItinerary": [',
    '    {"day": 1, "title": "Arrival", "activities": ["..."]}',
    '  ],',
    '  "tips": ["...", "..."]',
    '}',
  ].join('\n');

  const plan = await askJSON(model, prompt, ws);
  return plan || { title: 'Travel Plan', summary: 'Could not generate a complete plan.', sections: [], tips: [] };
}

// ─── Main Entry Point ──────────────────────────────────────

export async function startVisionLoop(ws, userGoal, signal) {
  const browser = new BrowserManager();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  try {
    await browser.init();

    // Expose browser so server.js can forward user interactions
    signal.browser = browser;

    // ── Phase 1: Task Decomposition ──
    safeSend(ws, { type: 'PHASE', phase: 'planning', text: 'Analyzing your request…' });
    await sleep(8000); // rate-limit buffer
    const { tasks, constraints } = await planTasks(model, userGoal, ws);

    if (shouldStop(ws, signal)) return;

    // ── Phase 2: Autonomous Research ──
    safeSend(ws, { type: 'PHASE', phase: 'researching', text: `Researching ${tasks.length} tasks…` });
    const allFindings = [];

    for (const task of tasks) {
      if (shouldStop(ws, signal)) break;

      safeSend(ws, {
        type: 'TASK_START',
        taskId: task.id,
        category: task.category,
        description: task.description,
      });

      const findings = await researchTask(model, task, constraints, browser, ws, signal);
      allFindings.push(...findings);

      safeSend(ws, {
        type: 'TASK_COMPLETE',
        taskId: task.id,
        findingsCount: findings.length,
      });

      // Brief pause between tasks
      await sleep(5000);
    }

    if (shouldStop(ws, signal)) {
      safeSend(ws, { type: 'DONE', summary: 'Agent stopped by user.' });
      return;
    }

    // ── Phase 3: Optimization ──
    await sleep(8000);
    const optimized = await optimizeResults(model, allFindings, constraints, ws);

    safeSend(ws, { type: 'OPTIMIZED', data: optimized });

    if (shouldStop(ws, signal)) return;

    // ── Phase 4: Travel Plan Generation ──
    await sleep(8000);
    const travelPlan = await generateTravelPlan(model, userGoal, optimized, constraints, allFindings, ws);

    safeSend(ws, { type: 'TRAVEL_PLAN', plan: travelPlan });
    safeSend(ws, {
      type: 'DONE',
      summary: travelPlan.summary || 'Travel plan generated successfully.',
    });

  } catch (err) {
    console.error('Agent pipeline error:', err);
    safeSend(ws, { type: 'ERROR', text: err.message });
  } finally {
    await browser.close();
  }
}
