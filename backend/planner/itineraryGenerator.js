/**
 * Itinerary Generator - Create detailed timeline for the trip
 */

/**
 * Generate timeline for a trip plan
 * @param {Object} params - Trip parameters
 * @param {Object} transport - Selected transport
 * @param {Array} places - Selected places to visit
 * @param {Array} restaurants - Selected restaurants
 * @returns {Array} Timeline with activities
 */
export function generateTimeline(params, transport, places, restaurants) {
  const { duration, source, destination } = params
  const timeline = []

  // Day-wise timeline
  for (let day = 1; day <= duration; day++) {
    const dayTimeline = []
    let currentTime = 6 // Start at 6 AM

    // Morning - Departure (Day 1 only)
    if (day === 1 && source) {
      dayTimeline.push({
        time: formatTime(currentTime, 0),
        activity: `Start journey from ${source}`,
        location: source,
        cost: 0
      })

      currentTime = parseTime(transport.departureTime)
      
      dayTimeline.push({
        time: transport.departureTime,
        activity: `Board ${transport.mode} - ${transport.operator}`,
        location: `${source} to ${destination}`,
        cost: transport.price
      })

      currentTime = parseTime(transport.arrivalTime)
      
      dayTimeline.push({
        time: transport.arrivalTime,
        activity: `Arrive at ${destination}`,
        location: destination,
        cost: 0
      })

      currentTime += 0.5 // 30 min break
    } else {
      currentTime = 8 // Start at 8 AM for subsequent days
    }

    // Add breakfast
    const breakfast = restaurants.find(r => r.priceForTwo < 300) || restaurants[0]
    if (breakfast) {
      dayTimeline.push({
        time: formatTime(currentTime, 0),
        activity: `Breakfast at ${breakfast.name}`,
        location: breakfast.name,
        cost: Math.round(breakfast.priceForTwo / 2)
      })
      currentTime += 1 // 1 hour for breakfast
    }

    // Morning places
    const placesPerDay = Math.ceil(places.length / duration)
    const startIdx = (day - 1) * placesPerDay
    const endIdx = Math.min(startIdx + placesPerDay, places.length)
    const dayPlaces = places.slice(startIdx, endIdx)

    // Visit morning places (2 places)
    const morningPlaces = dayPlaces.slice(0, Math.min(2, dayPlaces.length))
    for (const place of morningPlaces) {
      dayTimeline.push({
        time: formatTime(currentTime, 0),
        activity: `Visit ${place.name}`,
        location: place.name,
        cost: place.entryFee
      })
      
      // Calculate time based on duration
      const visitHours = parseFloat(place.duration) || 1.5
      currentTime += visitHours
    }

    // Lunch
    const lunch = restaurants.find(r => r.priceForTwo >= 300 && r.priceForTwo < 600) || restaurants[1] || restaurants[0]
    if (lunch && currentTime < 14) {
      currentTime = 13 // Ensure lunch at 1 PM
    }
    
    if (lunch) {
      dayTimeline.push({
        time: formatTime(currentTime, 0),
        activity: `Lunch at ${lunch.name}`,
        location: lunch.name,
        cost: Math.round(lunch.priceForTwo / 2)
      })
      currentTime += 1.5 // 1.5 hours for lunch
    }

    // Afternoon places
    const afternoonPlaces = dayPlaces.slice(2)
    for (const place of afternoonPlaces) {
      if (currentTime >= 18) break // Don't add more after 6 PM

      dayTimeline.push({
        time: formatTime(currentTime, 0),
        activity: `Visit ${place.name}`,
        location: place.name,
        cost: place.entryFee
      })
      
      const visitHours = parseFloat(place.duration) || 1.5
      currentTime += visitHours
    }

    // Evening snacks/tea
    if (currentTime < 17) {
      currentTime = 17 // 5 PM
    }
    
    const snacks = restaurants[Math.floor(restaurants.length / 2)] || restaurants[0]
    if (snacks && currentTime < 19) {
      dayTimeline.push({
        time: formatTime(currentTime, 0),
        activity: `Tea/Snacks at ${snacks.name}`,
        location: snacks.name,
        cost: 100
      })
      currentTime += 0.5
    }

    // Dinner
    if (currentTime < 20) {
      currentTime = 20 // 8 PM
    }
    
    const dinner = restaurants.find(r => r.priceForTwo >= 400) || restaurants[restaurants.length - 1] || restaurants[0]
    if (dinner) {
      dayTimeline.push({
        time: formatTime(currentTime, 0),
        activity: `Dinner at ${dinner.name}`,
        location: dinner.name,
        cost: Math.round(dinner.priceForTwo / 2)
      })
      currentTime += 1.5
    }

    // Return journey (last day if source specified)
    if (day === duration && source) {
      dayTimeline.push({
        time: formatTime(currentTime, 0),
        activity: `Return journey to ${source}`,
        location: `${destination} to ${source}`,
        cost: transport.price
      })
    }

    // Add day separator in timeline
    if (day > 1) {
      timeline.push({
        time: `Day ${day}`,
        activity: '────────',
        location: '',
        cost: 0
      })
    }

    timeline.push(...dayTimeline)
  }

  return timeline
}

/**
 * Convert hour to time string
 */
function formatTime(hour, minute = 0) {
  const h = Math.floor(hour)
  const m = minute || Math.round((hour - h) * 60)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
  
  return `${displayHour}:${m.toString().padStart(2, '0')} ${ampm}`
}

/**
 * Parse time string to hour
 */
function parseTime(timeStr) {
  if (!timeStr) return 12
  
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!match) return 12
  
  let hour = parseInt(match[1], 10)
  const minute = parseInt(match[2], 10)
  const ampm = match[3].toUpperCase()
  
  if (ampm === 'PM' && hour !== 12) hour += 12
  if (ampm === 'AM' && hour === 12) hour = 0
  
  return hour + (minute / 60)
}

/**
 * Generate things required checklist
 */
export function generateChecklist(params, weather, places) {
  const items = [
    'Valid ID proof',
    'Mobile phone & charger',
    'Camera',
    'Water bottle',
    'Snacks for journey',
    'Cash & cards',
    'Basic medicines',
    'Hand sanitizer'
  ]

  // Weather-based items
  if (weather.conditions === 'Rain' || weather.conditions === 'Drizzle') {
    items.push('Umbrella', 'Raincoat')
  }

  const temp = parseInt(weather.temperature)
  if (temp && temp < 20) {
    items.push('Warm clothes', 'Jacket/Sweater')
  } else if (temp && temp > 30) {
    items.push('Sunscreen', 'Hat/Cap', 'Sunglasses')
  }

  // Place-based items
  const hasReligiousSite = places.some(p => p.type === 'Religious')
  if (hasReligiousSite) {
    items.push('Modest clothing for temples')
  }

  const hasNatureSite = places.some(p => p.type === 'Nature' || p.type === 'Viewpoint')
  if (hasNatureSite) {
    items.push('Comfortable walking shoes', 'Trekking gear (if needed)')
  }

  // Duration-based items
  if (params.duration > 1) {
    items.push('Change of clothes', 'Toiletries')
  }

  return items
}
