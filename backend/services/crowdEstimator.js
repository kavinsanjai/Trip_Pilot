/**
 * Estimate crowd levels at tourist places
 * Based on ratings, reviews, and time factors
 */

/**
 * Estimate crowd level for a place
 * @param {Object} place - Place object with rating and other details
 * @param {string} dayOfWeek - Day of the week (Monday, Tuesday, etc.)
 * @param {number} month - Month (1-12)
 * @returns {Object} Crowd estimation
 */
export function estimateCrowdLevel(place, dayOfWeek, month) {
  let crowdLevel = 'Moderate'
  let crowdScore = 5 // out of 10
  
  // Higher rated places attract more crowds
  const rating = parseFloat(place.rating) || 4.0
  if (rating >= 4.5) {
    crowdScore += 2
  } else if (rating >= 4.0) {
    crowdScore += 1
  }
  
  // Weekend factor
  const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday'
  if (isWeekend) {
    crowdScore += 2
  }
  
  // Peak season factor (Nov-Feb for most Indian destinations)
  const isPeakSeason = month >= 11 || month <= 2
  if (isPeakSeason) {
    crowdScore += 1
  }
  
  // Place type factor
  if (place.type === 'Religious') {
    crowdScore += 1 // Religious places often crowded
  } else if (place.type === 'Museum') {
    crowdScore -= 1 // Museums less crowded
  }
  
  // Determine level based on score
  if (crowdScore <= 4) {
    crowdLevel = 'Low'
  } else if (crowdScore <= 7) {
    crowdLevel = 'Moderate'
  } else {
    crowdLevel = 'High'
  }
  
  return {
    level: crowdLevel,
    score: Math.min(crowdScore, 10),
    bestTimeToVisit: getBestTimeToVisit(crowdLevel, place.type)
  }
}

/**
 * Get best time to visit based on crowd level
 */
function getBestTimeToVisit(crowdLevel, placeType) {
  if (crowdLevel === 'High') {
    if (placeType === 'Religious') {
      return 'Visit early morning (6-8 AM) or late evening (after 6 PM) to avoid crowds'
    }
    return 'Visit early morning or weekdays to avoid peak crowds'
  }
  
  if (crowdLevel === 'Moderate') {
    return 'Visit during afternoon hours (2-4 PM) for fewer crowds'
  }
  
  return 'Any time is good as crowds are generally low'
}

/**
 * Get overall crowd advice for the trip
 */
export function getOverallCrowdAdvice(date) {
  const tripDate = new Date(date)
  const dayOfWeek = tripDate.toLocaleDateString('en-US', { weekday: 'long' })
  const month = tripDate.getMonth() + 1
  
  const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday'
  const isPeakSeason = month >= 11 || month <= 2
  
  let advice = `Traveling on ${dayOfWeek}. `
  
  if (isWeekend) {
    advice += 'Weekends are usually crowded at tourist spots. '
    advice += 'Consider starting early (7-8 AM) to avoid rush. '
  } else {
    advice += 'Weekday travel means fewer crowds at most places. '
  }
  
  if (isPeakSeason) {
    advice += 'This is peak tourist season, expect higher crowds and book transport in advance. '
  } else {
    advice += 'Off-season travel means better prices and fewer tourists. '
  }
  
  advice += 'Book tickets online where possible to save time.'
  
  return advice
}

/**
 * Get time-specific crowd estimates
 */
export function getTimeBasedCrowdAdvice(places) {
  const morningHours = places.filter(p => {
    const estimation = estimateCrowdLevel(p, 'Monday', new Date().getMonth() + 1)
    return estimation.level === 'Low' || estimation.level === 'Moderate'
  })
  
  const advice = []
  
  if (morningHours.length > 0) {
    advice.push(`Visit ${morningHours[0].name} early morning (7-9 AM) for best experience with fewer crowds.`)
  }
  
  advice.push('Popular temples and monuments are crowded during 10 AM - 12 PM.')
  advice.push('Restaurants get busy during lunch (1-2 PM) and dinner (8-9 PM) hours.')
  advice.push('Shopping areas are best visited in late afternoon (4-6 PM).')
  
  return advice
}
