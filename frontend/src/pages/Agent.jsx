import { useState, useEffect, useRef, useCallback } from 'react'
import Navbar from '../components/Navbar'

// ─── Phase badge colors ──────────────────────────────────────
const PHASE_META = {
  planning:    { label: 'Planning',    color: 'bg-purple-500' },
  researching: { label: 'Researching', color: 'bg-blue-500' },
  optimizing:  { label: 'Optimizing',  color: 'bg-amber-500' },
  generating:  { label: 'Generating',  color: 'bg-green-500' },
  done:        { label: 'Done',        color: 'bg-emerald-500' },
}

const Agent = ({ user }) => {
  const wsRef = useRef(null)
  const logEndRef = useRef(null)

  const [goal, setGoal] = useState('')
  const [status, setStatus] = useState('Idle')
  const [screenshot, setScreenshot] = useState(null)
  const [connected, setConnected] = useState(false)
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState([])

  // New multi-phase state
  const [phase, setPhase] = useState(null)        // current phase key
  const [taskPlan, setTaskPlan] = useState(null)   // { tasks, constraints }
  const [taskStatus, setTaskStatus] = useState({}) // taskId → { status, findings }
  const [collectedData, setCollectedData] = useState([]) // all extracted items
  const [optimized, setOptimized] = useState(null) // optimization result
  const [travelPlan, setTravelPlan] = useState(null) // final plan JSON

  // User interaction state
  const [userInput, setUserInput] = useState('')    // text to type into browser
  const [clickMarker, setClickMarker] = useState(null) // {x,y} for visual feedback
  const imgRef = useRef(null)

  // CAPTCHA state
  const [captchaActive, setCaptchaActive] = useState(false)
  const [captchaText, setCaptchaText] = useState('')

  // Rate-limit state
  const [rateLimitMsg, setRateLimitMsg] = useState(null)

  // ─── WebSocket setup ────────────────────────────────────
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000')
    wsRef.current = ws

    ws.onopen = () => {
      console.log('WebSocket connected')
      setConnected(true)
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)

        switch (msg.type) {
          /* ── Existing ── */
          case 'SCREENSHOT':
            setScreenshot(`data:image/jpeg;base64,${msg.data}`)
            break
          case 'REASONING':
            setStatus(msg.text)
            setLog((p) => [...p, msg.text])
            break
          case 'STATUS':
            setStatus(msg.text)
            break
          case 'RATE_LIMIT':
            setStatus(msg.text)
            setRateLimitMsg(msg.text)
            setLog((p) => [...p, `⏳ ${msg.text}`])
            // Auto-clear once the wait is over
            if (msg.waitSec) setTimeout(() => setRateLimitMsg(null), msg.waitSec * 1000)
            break
          case 'ERROR':
            setStatus(`Error: ${msg.text}`)
            setRunning(false)
            break

          /* ── Phase tracking ── */
          case 'PHASE':
            setPhase(msg.phase)
            setStatus(msg.text)
            setLog((p) => [...p, `── ${msg.text} ──`])
            break

          /* ── Task decomposition ── */
          case 'PLAN':
            setTaskPlan({ tasks: msg.tasks, constraints: msg.constraints })
            setLog((p) => [...p, `📋 Plan: ${msg.tasks.length} tasks created`])
            break

          /* ── Per-task updates ── */
          case 'TASK_START':
            setTaskStatus((prev) => ({
              ...prev,
              [msg.taskId]: { status: 'running', description: msg.description, category: msg.category, findings: 0 },
            }))
            setLog((p) => [...p, `▶ Task ${msg.taskId}: ${msg.description}`])
            break
          case 'TASK_STATUS':
            setStatus(msg.text)
            setLog((p) => [...p, msg.text])
            break
          case 'TASK_COMPLETE':
            setTaskStatus((prev) => ({
              ...prev,
              [msg.taskId]: { ...prev[msg.taskId], status: 'done', findings: msg.findingsCount },
            }))
            setLog((p) => [...p, `✅ Task ${msg.taskId} complete (${msg.findingsCount} items found)`])
            break

          /* ── Data collection ── */
          case 'DATA_COLLECTED':
            if (msg.latest) {
              setCollectedData((prev) => [...prev, ...msg.latest])
            }
            setLog((p) => [...p, `📦 Extracted ${msg.latest?.length || 0} items (total: ${msg.count})`])
            break

          /* ── Optimization ── */
          case 'OPTIMIZED':
            setOptimized(msg.data)
            setLog((p) => [...p, '⚡ Optimization complete'])
            break

          /* ── Final plan ── */
          case 'TRAVEL_PLAN':
            setTravelPlan(msg.plan)
            setLog((p) => [...p, `🗺️ Travel plan generated: ${msg.plan?.title || ''}`])
            break

          case 'CAPTCHA':
            setCaptchaActive(true)
            setCaptchaText(msg.text)
            setStatus('⚠️ CAPTCHA — waiting for you to solve it…')
            setLog((p) => [...p, `⚠️ CAPTCHA detected`])
            break
          case 'CAPTCHA_CLEARED':
            setCaptchaActive(false)
            setCaptchaText('')
            setStatus(msg.text)
            setLog((p) => [...p, `✅ ${msg.text}`])
            break

          case 'DONE':
            setPhase('done')
            setStatus('Done')
            setRunning(false)
            setCaptchaActive(false)
            setLog((p) => [...p, `✅ ${msg.summary}`])
            break

          default:
            break
        }
      } catch (err) {
        console.error('Failed to parse WS message:', err)
      }
    }

    ws.onclose = () => { setConnected(false); setRunning(false) }
    ws.onerror = () => { setConnected(false) }
    return () => ws.close()
  }, [])

  // ─── Actions ────────────────────────────────────────────
  const handleStart = () => {
    if (!goal.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify({ type: 'START_AGENT', goal }))
    setRunning(true)
    setStatus('Starting agent…')
    setPhase(null)
    setTaskPlan(null)
    setTaskStatus({})
    setCollectedData([])
    setOptimized(null)
    setTravelPlan(null)
    setScreenshot(null)
    setCaptchaActive(false)
    setRateLimitMsg(null)
    setLog([])
  }

  const handleStop = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify({ type: 'STOP_AGENT' }))
    setStatus('Stopping…')
  }

  // ─── User Interaction Helpers ──────────────────────────
  const wsSend = useCallback((obj) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(obj))
    }
  }, [])

  // Click on screenshot → forward to browser at scaled coordinates
  const handleScreenshotClick = useCallback((e) => {
    const img = imgRef.current
    if (!img) return
    const rect = img.getBoundingClientRect()
    // Map displayed coords to 1280×720 viewport
    const x = Math.round((e.clientX - rect.left) / rect.width * 1280)
    const y = Math.round((e.clientY - rect.top) / rect.height * 720)
    wsSend({ type: 'USER_CLICK', x, y })
    // Visual click marker
    setClickMarker({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setTimeout(() => setClickMarker(null), 600)
    // Request fresh screenshot after a short delay
    setTimeout(() => wsSend({ type: 'USER_SCREENSHOT' }), 1500)
  }, [wsSend])

  const handleUserType = useCallback(() => {
    if (!userInput.trim()) return
    wsSend({ type: 'USER_TYPE', text: userInput })
    setUserInput('')
    setTimeout(() => wsSend({ type: 'USER_SCREENSHOT' }), 1000)
  }, [userInput, wsSend])

  const handleUserKey = useCallback((key) => {
    wsSend({ type: 'USER_KEY', key })
    setTimeout(() => wsSend({ type: 'USER_SCREENSHOT' }), 1500)
  }, [wsSend])

  const handleUserScroll = useCallback((direction) => {
    wsSend({ type: 'USER_SCROLL', direction })
    setTimeout(() => wsSend({ type: 'USER_SCREENSHOT' }), 1000)
  }, [wsSend])

  const handleUserBack = useCallback(() => {
    wsSend({ type: 'USER_BACK' })
    setTimeout(() => wsSend({ type: 'USER_SCREENSHOT' }), 2000)
  }, [wsSend])

  // Auto-scroll log
  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [log])

  // ─── Derived helpers ────────────────────────────────────
  const phaseMeta = PHASE_META[phase] || null
  const canInteract = connected && screenshot

  // ─── Render ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar user={user} />

      <div className="flex flex-1 overflow-hidden">
        {/* ━━ Left Sidebar ━━ */}
        <aside className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col p-5 gap-5 shrink-0 overflow-y-auto">
          {/* Connection */}
          <div className="flex items-center gap-2 text-sm">
            <span className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-green-400' : 'bg-red-500'}`} />
            <span className="text-gray-400">{connected ? 'Connected' : 'Disconnected'}</span>
            {phaseMeta && (
              <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full text-white ${phaseMeta.color}`}>
                {phaseMeta.label}
              </span>
            )}
          </div>

          {/* Goal */}
          <div className="flex flex-col gap-2">
            <label htmlFor="goal" className="text-sm font-medium text-gray-300">Travel Goal</label>
            <textarea
              id="goal" rows={3}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder='e.g. "Plan a 5-day trip to Tokyo under $2000 in March"'
              value={goal} onChange={(e) => setGoal(e.target.value)} disabled={running}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button onClick={handleStart} disabled={!connected || running || !goal.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
              {running ? 'Running…' : 'Start Agent'}
            </button>
            {running && (
              <button onClick={handleStop}
                className="px-4 bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
                Stop
              </button>
            )}
          </div>

          {/* Status */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Status</h3>
            <p className="text-sm text-gray-300 bg-gray-800 rounded-lg px-3 py-2 break-words">{status}</p>
          </div>

          {/* Task Plan */}
          {taskPlan && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Task Plan</h3>
              <div className="space-y-1.5">
                {taskPlan.tasks.map((t) => {
                  const ts = taskStatus[t.id]
                  const icon = ts?.status === 'done' ? '✅' : ts?.status === 'running' ? '🔄' : '⬜'
                  return (
                    <div key={t.id} className="bg-gray-800 rounded-lg px-3 py-2 text-xs flex items-start gap-2">
                      <span className="mt-0.5">{icon}</span>
                      <div className="min-w-0">
                        <span className="font-semibold text-gray-200 capitalize">{t.category}</span>
                        <p className="text-gray-400 truncate">{t.description}</p>
                        {ts?.findings > 0 && <p className="text-blue-400 mt-0.5">{ts.findings} items found</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
              {taskPlan.constraints?.budget && (
                <p className="text-xs text-amber-400 mt-2">Budget: {taskPlan.constraints.budget}</p>
              )}
            </div>
          )}

          {/* Log */}
          {log.length > 0 && (
            <div className="flex-1 min-h-0">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Log</h3>
              <div className="bg-gray-800 rounded-lg px-3 py-2 text-xs text-gray-400 overflow-y-auto max-h-40 space-y-0.5 font-mono">
                {log.map((entry, i) => <p key={i}>{entry}</p>)}
                <div ref={logEndRef} />
              </div>
            </div>
          )}
        </aside>

        {/* ━━ Main Content ━━ */}
        <main className="flex-1 flex flex-col bg-gray-950 p-6 overflow-y-auto gap-6">

          {/* Rate-limit banner */}
          {rateLimitMsg && (
            <div className="w-full flex items-start gap-3 bg-yellow-950/60 border border-yellow-600 rounded-xl px-5 py-4">
              <span className="text-2xl mt-0.5">⏳</span>
              <div>
                <p className="font-bold text-yellow-400 text-sm">API Rate Limit</p>
                <p className="text-yellow-200 text-xs mt-1">{rateLimitMsg}</p>
                <p className="text-yellow-300/60 text-xs mt-1">The agent will resume automatically when the cooldown ends.</p>
              </div>
            </div>
          )}

          {/* CAPTCHA banner */}
          {captchaActive && (
            <div className="w-full flex items-start gap-3 bg-orange-950/60 border border-orange-500 rounded-xl px-5 py-4 animate-pulse">
              <span className="text-2xl mt-0.5">🤖</span>
              <div>
                <p className="font-bold text-orange-400 text-sm">CAPTCHA Detected — Action Required</p>
                <p className="text-orange-200 text-xs mt-1">{captchaText}</p>
                <p className="text-orange-300/70 text-xs mt-1">
                  Click the screenshot below to interact directly with the browser and solve the CAPTCHA.
                  The agent will resume automatically once it&apos;s cleared.
                </p>
              </div>
            </div>
          )}

          {/* Phase pipeline indicator */}
          {phase && (
            <div className="flex items-center gap-2 text-xs font-medium">
              {Object.entries(PHASE_META).map(([key, meta]) => (
                <div key={key} className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-colors
                  ${phase === key ? `${meta.color} text-white` : 'bg-gray-800 text-gray-500'}
                  ${Object.keys(PHASE_META).indexOf(key) < Object.keys(PHASE_META).indexOf(phase) ? 'bg-gray-700 text-gray-300' : ''}`}>
                  {Object.keys(PHASE_META).indexOf(key) < Object.keys(PHASE_META).indexOf(phase) && <span>✓</span>}
                  {meta.label}
                </div>
              ))}
            </div>
          )}

          {/* Travel Plan Card */}
          {travelPlan && (
            <div className="w-full bg-gradient-to-br from-blue-900/40 to-purple-900/30 border border-blue-700/50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-1">{travelPlan.title}</h2>
              <p className="text-sm text-gray-300 mb-4">{travelPlan.summary}</p>

              {travelPlan.estimatedBudget && (
                <p className="text-sm font-semibold text-amber-400 mb-4">Estimated Budget: {travelPlan.estimatedBudget}</p>
              )}

              {/* Sections */}
              {travelPlan.sections?.map((s, i) => (
                <div key={i} className="mb-4 bg-gray-800/60 rounded-xl p-4">
                  <h3 className="font-semibold text-white text-sm mb-1">{s.title}</h3>
                  <p className="text-sm text-blue-300">{s.recommendation}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.details}</p>
                  {s.estimatedCost && <p className="text-xs text-amber-400 mt-1">Cost: {s.estimatedCost}</p>}
                  {s.alternatives?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {s.alternatives.map((alt, j) => (
                        <span key={j} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{alt}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Daily Itinerary */}
              {travelPlan.dailyItinerary?.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Daily Itinerary</h3>
                  <div className="space-y-2">
                    {travelPlan.dailyItinerary.map((day, i) => (
                      <div key={i} className="bg-gray-800/60 rounded-lg px-4 py-2 text-xs">
                        <span className="font-bold text-white">Day {day.day}:</span>{' '}
                        <span className="text-blue-300">{day.title}</span>
                        <ul className="mt-1 text-gray-400 list-disc list-inside">
                          {day.activities?.map((a, j) => <li key={j}>{a}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {travelPlan.tips?.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Tips</h3>
                  <ul className="text-xs text-gray-400 list-disc list-inside space-y-1">
                    {travelPlan.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Optimization Card */}
          {optimized && !travelPlan && (
            <div className="w-full bg-amber-900/20 border border-amber-700/50 rounded-xl p-5">
              <h3 className="text-amber-400 font-semibold text-sm mb-2">⚡ Optimization Results</h3>
              <p className="text-xs text-gray-300 mb-3">{optimized.reasoning}</p>
              {optimized.totalEstimate && (
                <p className="text-sm font-bold text-amber-300 mb-3">Total Estimate: {optimized.totalEstimate}</p>
              )}
              {optimized.ranked?.map((r, i) => (
                <div key={i} className="bg-gray-800/60 rounded-lg p-3 mb-2 text-xs">
                  <span className="font-semibold text-white capitalize">{r.category}</span>
                  {r.recommended && (
                    <p className="text-blue-300 mt-1">
                      Recommended: {r.recommended.name} — {r.recommended.price}
                      <span className="text-gray-500 ml-2">{r.recommended.reason}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Collected Data Summary */}
          {collectedData.length > 0 && !travelPlan && (
            <div className="w-full bg-gray-800/40 border border-gray-700 rounded-xl p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Collected Data ({collectedData.length} items)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {collectedData.map((item, i) => (
                  <div key={i} className="bg-gray-800 rounded-lg p-2.5 text-xs">
                    <p className="font-semibold text-white truncate">{item.name || 'Unknown'}</p>
                    {item.price && <p className="text-green-400">{item.price}</p>}
                    {item.rating && <p className="text-amber-400">★ {item.rating}</p>}
                    {item.details && <p className="text-gray-400 truncate">{item.details}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Browser Screenshot — interactive */}
          {screenshot ? (
            <div className="w-full">
              {/* Clickable screenshot */}
              <div className="relative inline-block w-full cursor-crosshair" onClick={handleScreenshotClick}>
                <img ref={imgRef} src={screenshot} alt="Browser viewport"
                  className="w-full rounded-xl border border-gray-800 shadow-2xl select-none" draggable={false} />
                {/* Click indicator */}
                {clickMarker && (
                  <span className="absolute pointer-events-none animate-ping" style={{
                    left: clickMarker.x - 10, top: clickMarker.y - 10,
                    width: 20, height: 20, borderRadius: '50%',
                    background: 'rgba(59,130,246,0.6)', border: '2px solid #3b82f6',
                  }} />
                )}
                <p className="absolute bottom-2 right-3 text-[10px] text-gray-500 bg-gray-900/80 px-2 py-0.5 rounded">
                  Click to interact
                </p>
              </div>

              {/* Interaction toolbar */}
              {canInteract && (
                <div className="mt-3 flex items-center gap-2">
                  {/* Text input */}
                  <input
                    type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleUserType() } }}
                    placeholder="Type text into browser…"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button onClick={handleUserType} disabled={!userInput.trim()}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                    Send
                  </button>

                  <div className="h-6 w-px bg-gray-700" />

                  {/* Quick action buttons */}
                  <button onClick={() => handleUserKey('Enter')} title="Press Enter"
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-2 rounded-lg transition-colors border border-gray-700">
                    Enter ↵
                  </button>
                  <button onClick={() => handleUserScroll('down')} title="Scroll Down"
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-2 rounded-lg transition-colors border border-gray-700">
                    ↓ Scroll
                  </button>
                  <button onClick={() => handleUserScroll('up')} title="Scroll Up"
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-2 rounded-lg transition-colors border border-gray-700">
                    ↑ Scroll
                  </button>
                  <button onClick={handleUserBack} title="Go Back"
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-2 rounded-lg transition-colors border border-gray-700">
                    ◀ Back
                  </button>
                </div>
              )}
            </div>
          ) : (
            !travelPlan && !running && (
              <div className="flex-1 flex items-center justify-center text-center text-gray-600">
                <div>
                  <p className="text-5xl mb-4">🌐</p>
                  <p className="text-lg font-medium">No browser stream yet</p>
                  <p className="text-sm mt-1">Enter a travel goal and start the agent.</p>
                </div>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  )
}

export default Agent
