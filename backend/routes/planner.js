import express from 'express'
import { parsePrompt, validateParameters } from '../planner/promptParser.js'
import { scrapeTransportOptions, findCheapestTransport, findComfortTransport } from '../scrapers/transportScraper.js'
import { scrapeTouristPlaces, getTopRatedPlaces } from '../scrapers/placesScraper.js'
import { scrapeRestaurants, getBudgetRestaurants, getPremiumRestaurants } from '../scrapers/restaurantScraper.js'
import { getWeatherForecast } from '../services/weatherService.js'
import { getOverallCrowdAdvice } from '../services/crowdEstimator.js'
import { generateTripPlans } from '../planner/optimizer.js'
import { generateTimeline, generateChecklist } from '../planner/itineraryGenerator.js'
import { 
  classifyIntent, 
  generateConversationalResponse, 
  extractTripParameters,
  hasEnoughTripInfo,
  generateMissingInfoPrompt 
} from '../services/conversationalAI.js'
import { validateDestination } from '../services/aiDataGenerator.js'
import supabase from '../config/supabase.js'

const router = express.Router()

/**
 * POST /plan-trip
 * Conversational trip planning endpoint
 * Handles: questions, casual chat, partial info, complete trip planning
 */
router.post('/plan-trip', async (req, res) => {
  try {
    const { prompt, conversationHistory = [] } = req.body

    if (!prompt) {
      return res.status(400).json({ 
        error: 'Please provide a message',
        example: 'Plan a 2 day trip from Chennai to Ooty under ₹15000'
      })
    }

    console.log('Received message:', prompt)

    // Step 1: Classify user intent
    const { intent, confidence, needsMoreInfo } = await classifyIntent(prompt)
    console.log(`Intent: ${intent}, Confidence: ${confidence}, Needs more info: ${needsMoreInfo}`)

    // Step 2: Handle based on intent
    
    // For general questions or casual chat - use conversational AI
    if (intent === 'question' || intent === 'casual') {
      const aiResponse = await generateConversationalResponse(prompt, conversationHistory)
      return res.json({
        type: 'conversation',
        message: aiResponse,
        intent: intent
      })
    }

    // For trip planning - extract parameters
    const params = extractTripParameters(prompt, conversationHistory)
    console.log('Extracted parameters:', params)

    // Check if we have enough info to plan
    if (!hasEnoughTripInfo(params) || needsMoreInfo) {
      // Ask for missing information conversationally
      let response = generateMissingInfoPrompt(params)
      
      // If no specific missing fields but still needs info, use AI
      if (!response) {
        response = await generateConversationalResponse(
          `User wants to plan a trip but I need more details. Here's what they said: "${prompt}". Ask them politely for: destination, duration, and optionally budget and starting location.`,
          conversationHistory
        )
      }
      
      return res.json({
        type: 'clarification',
        message: response,
        partialParams: params,
        intent: 'trip_planning'
      })
    }

    // We have enough info - proceed with trip planning
    console.log('Starting trip generation with full parameters:', params)

    // Add defaults
    if (!params.date) params.date = new Date()
    if (!params.travelers) params.travelers = 1
    if (!params.duration) params.duration = 1

    // Step 2.5: Validate destination (check if it's a real place)
    const destinationCheck = await validateDestination(params.destination)
    if (destinationCheck && !destinationCheck.valid) {
      return res.json({
        type: 'error',
        message: `I couldn't find information about "${params.destination}". ${destinationCheck.message || 'Please check the spelling or try a different destination.'}`,
        suggestion: destinationCheck.correctedName || null
      })
    }

    // Log destination info
    if (destinationCheck && destinationCheck.country) {
      console.log(`✓ Destination: ${params.destination}, ${destinationCheck.country} (${destinationCheck.continent})`)
    }

    // Step 3: Gather data in parallel
    console.log('Fetching travel data...')
    
    const dateStr = params.date.toISOString ? params.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    
    const [transportOptions, places, restaurants, weather] = await Promise.all([
      scrapeTransportOptions(params.source || params.destination, params.destination, dateStr),
      scrapeTouristPlaces(params.destination),
      scrapeRestaurants(params.destination),
      getWeatherForecast(params.destination)
    ])

    console.log(`Collected: ${transportOptions.length} transport, ${places.length} places, ${restaurants.length} restaurants`)

    // Step 4: Generate trip plans
    const plans = generateTripPlans(params, transportOptions, places, restaurants, weather)

    // Step 5: Generate timelines
    const budgetTransport = findCheapestTransport(transportOptions)
    const comfortTransport = findComfortTransport(transportOptions)

    const budgetPlaces = places.slice().sort((a, b) => a.entryFee - b.entryFee).slice(0, 5)
    const comfortPlaces = getTopRatedPlaces(places, 5)

    const budgetRestaurants = getBudgetRestaurants(restaurants, 300)
    const comfortRestaurants = getPremiumRestaurants(restaurants, 4.0)

    const budgetTimeline = generateTimeline(
      params, 
      budgetTransport, 
      budgetPlaces, 
      budgetRestaurants.slice(0, 5)
    )

    const comfortTimeline = generateTimeline(
      params, 
      comfortTransport, 
      comfortPlaces, 
      comfortRestaurants.slice(0, 5)
    )

    // Step 6: Generate additional info
    const crowdAdvice = getOverallCrowdAdvice(dateStr)
    const checklist = generateChecklist(params, weather, places)

    // Step 7: Prepare response
    const response = {
      type: 'trip_plan',
      budget_plan: {
        ...plans.budget_plan,
        timeline: budgetTimeline
      },
      comfort_plan: {
        ...plans.comfort_plan,
        timeline: comfortTimeline
      },
      comparison_table: plans.comparison_table,
      weather_advice: weather,
      crowd_advice: crowdAdvice,
      things_required: checklist,
      trip_summary: {
        source: params.source,
        destination: params.destination,
        duration: `${params.duration} day${params.duration > 1 ? 's' : ''}`,
        date: params.date.toLocaleDateString ? params.date.toLocaleDateString('en-IN') : dateStr,
        budget: params.budget ? `₹${params.budget}` : 'Not specified',
        travelers: params.travelers,
        recommended_plan: plans.recommended
      }
    }

    // Step 8: Save to database if user is authenticated
    const authHeader = req.headers.authorization
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)
        
        if (!authError && user) {
          // Save trip to database
          const { data: tripData, error: tripError } = await supabase
            .from('trips')
            .insert({
              user_id: user.id,
              prompt: prompt,
              source: params.source,
              destination: params.destination,
              budget: params.budget,
              duration: params.duration,
              travelers: params.travelers,
              trip_date: dateStr,
              budget_plan: response.budget_plan,
              comfort_plan: response.comfort_plan,
              comparison_table: plans.comparison_table,
              weather_advice: weather,
              crowd_advice: crowdAdvice,
              things_required: checklist,
              recommended_plan: plans.recommended,
              total_cost_budget: plans.budget_plan.breakdown?.total || 0,
              total_cost_comfort: plans.comfort_plan.breakdown?.total || 0
            })
            .select()
            .single()

          if (!tripError && tripData) {
            response.trip_id = tripData.id
            console.log('Trip saved to database:', tripData.id)
          }
        }
      } catch (dbError) {
        console.error('Error saving to database:', dbError)
        // Don't fail the request if DB save fails
      }
    }

    console.log('Trip planning completed successfully')
    res.json(response)

  } catch (error) {
    console.error('Error in trip planning:', error)
    res.status(500).json({ 
      type: 'error',
      error: 'Failed to process your request',
      message: 'Sorry, I encountered an error. Please try again or rephrase your message.',
      details: error.message
    })
  }
})

/**
 * GET /sample-prompts
 * Get sample prompts for users
 */
router.get('/sample-prompts', (req, res) => {
  const samples = [
    'Plan a 1 day trip from Ooty to Coimbatore under ₹10000',
    'Plan a 2 day trip from Chennai to Pondicherry under ₹5000',
    'Weekend getaway to Ooty from Bangalore, budget ₹8000 for 2 people',
    'Plan a day trip from Mumbai to Lonavala under ₹3000',
    'One day trip from Delhi to Agra for 3 people, budget ₹15000',
    '3 day trip to Goa from Pune under ₹12000'
  ]

  res.json({ samples })
})

/**
 * GET /trips
 * Get user's trip history
 */
router.get('/trips', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const { data: trips, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    res.json({ trips })
  } catch (error) {
    console.error('Error fetching trips:', error)
    res.status(500).json({ error: 'Failed to fetch trip history' })
  }
})

/**
 * GET /trips/:id
 * Get a specific trip by ID
 */
router.get('/trips/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const { data: trip, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      return res.status(404).json({ error: 'Trip not found' })
    }

    res.json(trip)
  } catch (error) {
    console.error('Error fetching trip:', error)
    res.status(500).json({ error: 'Failed to fetch trip' })
  }
})

/**
 * DELETE /trips/:id
 * Delete a trip
 */
router.delete('/trips/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    res.json({ message: 'Trip deleted successfully' })
  } catch (error) {
    console.error('Error deleting trip:', error)
    res.status(500).json({ error: 'Failed to delete trip' })
  }
})

/**
 * POST /saved-plans
 * Save a trip to saved plans
 */
router.post('/saved-plans', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const { trip_id, plan_name, notes } = req.body

    if (!trip_id || !plan_name) {
      return res.status(400).json({ error: 'trip_id and plan_name are required' })
    }

    const { data: savedPlan, error } = await supabase
      .from('saved_plans')
      .insert({
        user_id: user.id,
        trip_id: trip_id,
        plan_name: plan_name,
        notes: notes || null
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    res.json({ message: 'Plan saved successfully', savedPlan })
  } catch (error) {
    console.error('Error saving plan:', error)
    res.status(500).json({ error: 'Failed to save plan' })
  }
})

/**
 * GET /saved-plans
 * Get user's saved plans
 */
router.get('/saved-plans', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const { data: savedPlans, error } = await supabase
      .from('saved_plans')
      .select(`
        *,
        trips (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    res.json({ savedPlans })
  } catch (error) {
    console.error('Error fetching saved plans:', error)
    res.status(500).json({ error: 'Failed to fetch saved plans' })
  }
})

/**
 * DELETE /saved-plans/:id
 * Remove a saved plan
 */
router.delete('/saved-plans/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const { error } = await supabase
      .from('saved_plans')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    res.json({ message: 'Saved plan removed successfully' })
  } catch (error) {
    console.error('Error removing saved plan:', error)
    res.status(500).json({ error: 'Failed to remove saved plan' })
  }
})

/**
 * GET /preferences
 * Get user preferences
 */
router.get('/preferences', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    // Return default preferences if none exist
    if (!preferences) {
      return res.json({
        preferences: {
          preferred_budget_range: 'moderate',
          preferred_transport_mode: 'any',
          food_preference: 'any',
          accommodation_type: 'mid-range',
          activity_interests: [],
          default_travelers: 1,
          currency: 'INR',
          preferred_language: 'en'
        }
      })
    }

    res.json({ preferences })
  } catch (error) {
    console.error('Error fetching preferences:', error)
    res.status(500).json({ error: 'Failed to fetch preferences' })
  }
})

/**
 * PUT /preferences
 * Update user preferences
 */
router.put('/preferences', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const {
      preferred_budget_range,
      preferred_transport_mode,
      food_preference,
      accommodation_type,
      activity_interests,
      default_travelers,
      currency,
      preferred_language
    } = req.body

    // Try to update existing preferences
    const { data: existing } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single()

    let result
    if (existing) {
      // Update existing
      result = await supabase
        .from('user_preferences')
        .update({
          preferred_budget_range,
          preferred_transport_mode,
          food_preference,
          accommodation_type,
          activity_interests,
          default_travelers,
          currency,
          preferred_language
        })
        .eq('user_id', user.id)
        .select()
        .single()
    } else {
      // Insert new
      result = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          preferred_budget_range,
          preferred_transport_mode,
          food_preference,
          accommodation_type,
          activity_interests,
          default_travelers,
          currency,
          preferred_language
        })
        .select()
        .single()
    }

    if (result.error) {
      throw result.error
    }

    res.json({ message: 'Preferences updated successfully', preferences: result.data })
  } catch (error) {
    console.error('Error updating preferences:', error)
    res.status(500).json({ error: 'Failed to update preferences' })
  }
})

export default router
