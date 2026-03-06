/**
 * Conversational AI Service using Google Gemini
 * Handles general questions, clarifications, and natural conversations
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// System context for the travel assistant
const SYSTEM_CONTEXT = `You are TravelAgent AI, a friendly and knowledgeable travel planning assistant. 

Your capabilities:
- Answer travel-related questions about destinations, budgets, transportation, hotels, activities
- Provide travel tips, recommendations, and advice
- Help users plan trips with detailed itineraries
- Clarify trip requirements and preferences
- Have casual, helpful conversations about travel

When users want to plan a trip, guide them to provide:
- Source (starting location)
- Destination
- Duration (number of days)
- Budget (approximate)
- Travel date
- Number of travelers
- Preferences (adventure, relaxation, food, culture, etc.)

Be conversational, helpful, and enthusiastic about travel. Keep responses concise but informative.`

/**
 * Classify user message intent
 * @param {string} message - User's message
 * @returns {Object} { intent: 'trip_planning' | 'question' | 'casual', confidence: number, tripParams: Object }
 */
export async function classifyIntent(message) {
  const lowerMessage = message.toLowerCase()
  
  // Strong trip planning indicators
  const tripKeywords = ['plan', 'trip', 'travel', 'visit', 'go to', 'journey', 'vacation', 'itinerary', 'tour']
  const paramKeywords = ['from', 'to', 'budget', 'day', 'days', '₹', 'rs', 'under']
  
  const hasTripKeyword = tripKeywords.some(kw => lowerMessage.includes(kw))
  const hasParamKeyword = paramKeywords.some(kw => lowerMessage.includes(kw))
  
  // Check if it's a structured trip planning request
  const hasFromTo = /from\s+\w+\s+to\s+\w+/i.test(message)
  const hasBudget = /(?:under|budget|₹|rs\.?)\s*\d+/i.test(message)
  const hasDuration = /\d+\s*day/i.test(message)
  
  // Strong trip planning request
  if ((hasFromTo && (hasBudget || hasDuration)) || 
      (hasTripKeyword && hasParamKeyword && (hasBudget || hasDuration))) {
    return {
      intent: 'trip_planning',
      confidence: 0.9,
      needsMoreInfo: false
    }
  }
  
  // Partial trip information - needs clarification
  if (hasTripKeyword && (hasFromTo || hasDuration || hasBudget)) {
    return {
      intent: 'trip_planning',
      confidence: 0.6,
      needsMoreInfo: true
    }
  }
  
  // Travel-related question
  const questionKeywords = ['what', 'where', 'when', 'how', 'which', 'why', 'is', 'are', 'can', 'should', 'best']
  const hasQuestionKeyword = questionKeywords.some(kw => lowerMessage.startsWith(kw) || lowerMessage.includes(' ' + kw))
  
  if (hasQuestionKeyword || lowerMessage.includes('?')) {
    return {
      intent: 'question',
      confidence: 0.8,
      needsMoreInfo: false
    }
  }
  
  // Casual conversation or unclear
  return {
    intent: 'casual',
    confidence: 0.5,
    needsMoreInfo: false
  }
}

/**
 * Generate conversational response using Gemini
 * @param {string} userMessage - User's message
 * @param {Array} conversationHistory - Previous messages
 * @returns {Promise<string>} AI response
 */
export async function generateConversationalResponse(userMessage, conversationHistory = []) {
  try {
    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    // Build conversation context
    let prompt = SYSTEM_CONTEXT + '\n\n'
    
    // Add conversation history (last 5 messages)
    const recentHistory = conversationHistory.slice(-5)
    if (recentHistory.length > 0) {
      prompt += 'Previous conversation:\n'
      recentHistory.forEach(msg => {
        prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`
      })
      prompt += '\n'
    }
    
    prompt += `User: ${userMessage}\nAssistant:`
    
    // Generate response
    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    return response.trim()
  } catch (error) {
    console.error('Gemini API error:', error)
    
    // Fallback responses
    if (!process.env.GEMINI_API_KEY) {
      return `I'm here to help you plan amazing trips! To create a detailed itinerary, please tell me:
- Where are you traveling from and to?
- How many days?
- What's your budget?
- When do you plan to travel?

Or ask me any travel-related questions!`
    }
    
    return `I'm having trouble processing that right now. Could you rephrase your question or provide more details about your trip?`
  }
}

/**
 * Extract trip parameters from conversational context
 * @param {string} message - Current message
 * @param {Array} conversationHistory - Previous messages
 * @returns {Object} Extracted parameters
 */
export function extractTripParameters(message, conversationHistory = []) {
  // Combine current and previous messages
  const allMessages = [...conversationHistory.map(m => m.content), message].join(' ')
  
  const params = {
    source: null,
    destination: null,
    budget: null,
    duration: null,
    date: null,
    travelers: 1,
    preferences: []
  }
  
  const lowerText = allMessages.toLowerCase()
  
  // Extract source and destination
  const fromMatch = lowerText.match(/from\s+([a-z\s]+?)\s+to/i)
  const toMatch = lowerText.match(/to\s+([a-z\s]+?)(?:\s+|$|under|for|budget|in)/i)
  
  if (fromMatch) {
    params.source = capitalizeWords(fromMatch[1].trim())
  }
  
  if (toMatch) {
    params.destination = capitalizeWords(toMatch[1].trim())
  }
  
  // Extract budget
  const budgetMatch = lowerText.match(/(?:under|budget|₹|rs\.?)\s*(\d+(?:,\d+)*)/i)
  if (budgetMatch) {
    params.budget = parseInt(budgetMatch[1].replace(/,/g, ''), 10)
  }
  
  // Extract duration
  const durationMatch = lowerText.match(/(\d+)\s*day/i)
  if (durationMatch) {
    params.duration = parseInt(durationMatch[1], 10)
  }
  
  // Extract travelers
  const travelersMatch = lowerText.match(/(\d+)\s*(?:people|person|pax|travelers)/i)
  if (travelersMatch) {
    params.travelers = parseInt(travelersMatch[1], 10)
  }
  
  // Extract preferences
  if (lowerText.includes('adventure') || lowerText.includes('trekking')) params.preferences.push('adventure')
  if (lowerText.includes('relax') || lowerText.includes('peace')) params.preferences.push('relaxation')
  if (lowerText.includes('food') || lowerText.includes('culinary')) params.preferences.push('food')
  if (lowerText.includes('culture') || lowerText.includes('heritage')) params.preferences.push('culture')
  if (lowerText.includes('nature') || lowerText.includes('wildlife')) params.preferences.push('nature')
  
  return params
}

function capitalizeWords(str) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Check if we have enough information to plan a trip
 */
export function hasEnoughTripInfo(params) {
  return !!(params.destination && params.duration)
}

/**
 * Generate prompt to ask for missing information
 */
export function generateMissingInfoPrompt(params) {
  const missing = []
  
  if (!params.destination) missing.push('destination')
  if (!params.duration) missing.push('number of days')
  if (!params.budget) missing.push('budget (optional)')
  if (!params.source) missing.push('starting location (optional)')
  
  if (missing.length === 0) return null
  
  return `Great! To create the best itinerary for you, could you please provide: ${missing.join(', ')}?`
}
