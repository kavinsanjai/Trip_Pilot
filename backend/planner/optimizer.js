/**
 * Trip Optimizer - Compare options and generate Budget vs Comfort plans
 */

/**
 * Generate budget and comfort trip plans
 * @param {Object} params - Parsed trip parameters
 * @param {Array} transportOptions - Available transport options
 * @param {Array} places - Tourist places
 * @param {Array} restaurants - Restaurant options
 * @param {Object} weather - Weather information
 * @returns {Object} Complete trip plans
 */
export function generateTripPlans(params, transportOptions, places, restaurants, weather) {
  const { budget, duration, travelers } = params

  // Generate budget plan
  const budgetTransport = findCheapestOption(transportOptions)
  const budgetPlaces = selectBudgetPlaces(places, duration)
  const budgetRestaurants = selectBudgetRestaurants(restaurants, duration)
  
  const budgetCosts = calculateCosts(budgetTransport, budgetPlaces, budgetRestaurants, travelers)
  
  const budgetPlan = {
    total_cost: `₹${budgetCosts.total}`,
    transportation: `${budgetTransport.operator} - ${budgetTransport.type} (₹${budgetTransport.price})`,
    food: budgetRestaurants.map(r => `${r.name} (₹${r.priceForTwo})`).join(', '),
    activities: budgetPlaces.map(p => `${p.name} (₹${p.entryFee})`).join(', '),
    duration: `${duration} day${duration > 1 ? 's' : ''}`,
    breakdown: budgetCosts
  }

  // Generate comfort plan
  const comfortTransport = findComfortOption(transportOptions)
  const comfortPlaces = selectTopPlaces(places, duration)
  const comfortRestaurants = selectPremiumRestaurants(restaurants, duration)
  
  const comfortCosts = calculateCosts(comfortTransport, comfortPlaces, comfortRestaurants, travelers)
  
  const comfortPlan = {
    total_cost: `₹${comfortCosts.total}`,
    transportation: `${comfortTransport.operator} - ${comfortTransport.type} (₹${comfortTransport.price})`,
    food: comfortRestaurants.map(r => `${r.name} (₹${r.priceForTwo})`).join(', '),
    activities: comfortPlaces.map(p => `${p.name} (₹${p.entryFee})`).join(', '),
    duration: `${duration} day${duration > 1 ? 's' : ''}`,
    breakdown: comfortCosts
  }

  // Check if budget plan fits within user's budget
  const recommendedPlan = budget && budgetCosts.total <= budget ? 'budget' : 
                          budget && comfortCosts.total <= budget ? 'comfort' :
                          'budget'

  return {
    budget_plan: budgetPlan,
    comfort_plan: comfortPlan,
    recommended: recommendedPlan,
    comparison_table: generateComparisonTable(budgetPlan, comfortPlan)
  }
}

/**
 * Find cheapest transport option
 */
function findCheapestOption(options) {
  return options.reduce((min, option) => 
    option.price < min.price ? option : min
  )
}

/**
 * Find most comfortable transport option
 */
function findComfortOption(options) {
  const sorted = [...options].sort((a, b) => {
    const ratingDiff = parseFloat(b.rating) - parseFloat(a.rating)
    if (ratingDiff !== 0) return ratingDiff
    return b.price - a.price
  })
  return sorted[0]
}

/**
 * Select budget-friendly places
 */
function selectBudgetPlaces(places, duration) {
  const placesPerDay = duration === 1 ? 3 : 4
  const totalPlaces = Math.min(placesPerDay * duration, places.length)
  
  return places
    .sort((a, b) => a.entryFee - b.entryFee)
    .slice(0, totalPlaces)
}

/**
 * Select top-rated places
 */
function selectTopPlaces(places, duration) {
  const placesPerDay = duration === 1 ? 3 : 4
  const totalPlaces = Math.min(placesPerDay * duration, places.length)
  
  return places
    .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
    .slice(0, totalPlaces)
}

/**
 * Select budget restaurants
 */
function selectBudgetRestaurants(restaurants, duration) {
  const mealsPerDay = 3 // Breakfast, Lunch, Dinner
  const totalMeals = duration * mealsPerDay
  
  return restaurants
    .sort((a, b) => a.priceForTwo - b.priceForTwo)
    .slice(0, Math.min(totalMeals, restaurants.length))
}

/**
 * Select premium restaurants
 */
function selectPremiumRestaurants(restaurants, duration) {
  const mealsPerDay = 3
  const totalMeals = duration * mealsPerDay
  
  return restaurants
    .sort((a, b) => {
      const ratingDiff = parseFloat(b.rating) - parseFloat(a.rating)
      if (ratingDiff !== 0) return ratingDiff
      return b.priceForTwo - a.priceForTwo
    })
    .slice(0, Math.min(totalMeals, restaurants.length))
}

/**
 * Calculate total costs
 */
function calculateCosts(transport, places, restaurants, travelers) {
  const transportCost = transport.price * travelers
  const placesCost = places.reduce((sum, p) => sum + (p.entryFee * travelers), 0)
  const foodCost = restaurants.reduce((sum, r) => sum + (r.priceForTwo * Math.ceil(travelers / 2)), 0)
  const miscCost = Math.round((transportCost + placesCost + foodCost) * 0.15) // 15% buffer
  
  return {
    transport: transportCost,
    attractions: placesCost,
    food: foodCost,
    miscellaneous: miscCost,
    total: transportCost + placesCost + foodCost + miscCost
  }
}

/**
 * Generate comparison table data
 */
function generateComparisonTable(budgetPlan, comfortPlan) {
  return {
    budget_plan: {
      total_cost: budgetPlan.total_cost,
      transportation: budgetPlan.transportation,
      food: budgetPlan.food,
      activities: budgetPlan.activities,
      duration: budgetPlan.duration
    },
    comfort_plan: {
      total_cost: comfortPlan.total_cost,
      transportation: comfortPlan.transportation,
      food: comfortPlan.food,
      activities: comfortPlan.activities,
      duration: comfortPlan.duration
    }
  }
}

/**
 * Optimize itinerary based on location proximity
 */
export function optimizeRouting(places) {
  // Simple optimization: group places by area
  // In a real app, this would use GPS coordinates and routing algorithms
  
  const grouped = {}
  places.forEach(place => {
    const area = place.type || 'Other'
    if (!grouped[area]) grouped[area] = []
    grouped[area].push(place)
  })
  
  // Flatten back to array, grouped by type
  return Object.values(grouped).flat()
}
