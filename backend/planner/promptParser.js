/**
 * Parse natural language trip planning prompts
 * Extract: source, destination, budget, duration, date, preferences
 */

/**
 * Parse user's travel prompt
 * @param {string} prompt - Natural language prompt
 * @returns {Object} Parsed trip parameters
 */
export function parsePrompt(prompt) {
  const parsed = {
    source: null,
    destination: null,
    budget: null,
    duration: 1, // default 1 day
    date: new Date(), // default today
    travelers: 1, // default 1 person
    preferences: []
  }

  const lowerPrompt = prompt.toLowerCase()

  // Extract source and destination
  const fromMatch = lowerPrompt.match(/from\s+([a-z\s]+?)\s+to/i)
  const toMatch = lowerPrompt.match(/to\s+([a-z\s]+?)(?:\s+|$|under|for|budget|in)/i)
  
  if (fromMatch) {
    parsed.source = capitalizeWords(fromMatch[1].trim())
  }
  
  if (toMatch) {
    parsed.destination = capitalizeWords(toMatch[1].trim())
  }

  // Extract budget
  const budgetMatch = lowerPrompt.match(/(?:under|budget|₹|rs\.?)\s*(\d+(?:,\d+)*)/i)
  if (budgetMatch) {
    parsed.budget = parseInt(budgetMatch[1].replace(/,/g, ''), 10)
  }

  // Extract duration
  const durationMatch = lowerPrompt.match(/(\d+)\s*day/i)
  if (durationMatch) {
    parsed.duration = parseInt(durationMatch[1], 10)
  }

  // Extract number of travelers
  const travelersMatch = lowerPrompt.match(/(\d+)\s*(?:people|person|pax|travelers)/i)
  if (travelersMatch) {
    parsed.travelers = parseInt(travelersMatch[1], 10)
  }

  // Extract date if mentioned
  const datePatterns = [
    /on\s+(\d{1,2})[/-](\d{1,2})[/-](\d{4})/i, // DD-MM-YYYY
    /on\s+(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})/i // DD Month YYYY
  ]

  for (const pattern of datePatterns) {
    const dateMatch = lowerPrompt.match(pattern)
    if (dateMatch) {
      try {
        parsed.date = new Date(dateMatch[0].replace('on ', ''))
      } catch (e) {
        // Keep default date
      }
      break
    }
  }

  // Extract preferences
  if (lowerPrompt.includes('adventure') || lowerPrompt.includes('trekking')) {
    parsed.preferences.push('adventure')
  }
  if (lowerPrompt.includes('relax') || lowerPrompt.includes('peace')) {
    parsed.preferences.push('relaxation')
  }
  if (lowerPrompt.includes('food') || lowerPrompt.includes('culinary')) {
    parsed.preferences.push('food')
  }
  if (lowerPrompt.includes('culture') || lowerPrompt.includes('temple') || lowerPrompt.includes('heritage')) {
    parsed.preferences.push('culture')
  }
  if (lowerPrompt.includes('nature') || lowerPrompt.includes('wildlife')) {
    parsed.preferences.push('nature')
  }

  return parsed
}

/**
 * Capitalize each word
 */
function capitalizeWords(str) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Validate parsed parameters
 */
export function validateParameters(params) {
  const errors = []

  if (!params.destination) {
    errors.push('Destination not specified')
  }

  if (!params.budget && !params.duration) {
    errors.push('Please specify either budget or trip duration')
  }

  if (params.budget && params.budget < 500) {
    errors.push('Budget seems too low for a trip. Please specify at least ₹500')
  }

  if (params.duration > 30) {
    errors.push('Trip duration seems very long. Please specify up to 30 days')
  }

  return {
    valid: errors.length === 0,
    errors: errors
  }
}

/**
 * Generate a sample prompt for users
 */
export function generateSamplePrompt() {
  const samples = [
    'Plan a 2 day trip from Chennai to Pondicherry under ₹5000',
    'Weekend getaway to Ooty from Bangalore, budget ₹8000 for 2 people',
    'Plan a day trip from Mumbai to Lonavala under ₹3000',
    'One day trip from Delhi to Agra for 3 people, budget ₹15000',
    '3 day trip to Goa from Pune under ₹12000, adventure activities'
  ]

  return samples[Math.floor(Math.random() * samples.length)]
}
