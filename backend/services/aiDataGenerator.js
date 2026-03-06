/**
 * AI-Powered Universal Data Generator
 * Uses Google Gemini to generate realistic travel data for ANY destination worldwide
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

/**
 * Generate tourist places for ANY destination using AI
 * @param {string} destination - Destination city/country
 * @returns {Promise<Array>} Array of places to visit
 */
export async function generatePlacesWithAI(destination) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.log('No Gemini API key, using basic fallback')
      return getGenericPlaces(destination)
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const prompt = `Generate a JSON array of the top 10 tourist attractions in ${destination}. 
Include a mix of landmarks, museums, parks, religious sites, and entertainment venues.

For each place provide:
- name: Full name of the place
- type: Type (e.g., "Museum", "Park", "Temple", "Landmark", "Shopping", "Beach", "Monument")
- rating: Rating out of 5 (be realistic, between 3.5 and 5.0)
- entryFee: Entry fee in local currency converted to INR (0 if free)
- duration: Typical visit duration (e.g., "2-3h", "1h", "Half day")
- description: Brief one-line description

Return ONLY the JSON array, no other text. Format:
[
  {
    "name": "Place Name",
    "type": "Type",
    "rating": "4.5",
    "entryFee": 500,
    "duration": "2-3h",
    "description": "Brief description"
  }
]`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const places = JSON.parse(jsonMatch[0])
      console.log(`Generated ${places.length} places for ${destination} using AI`)
      return places
    }
    
    throw new Error('Could not parse AI response')
  } catch (error) {
    console.error('Error generating places with AI:', error.message)
    return getGenericPlaces(destination)
  }
}

/**
 * Generate restaurants for ANY destination using AI
 * @param {string} location - City/location name
 * @returns {Promise<Array>} Array of restaurant options
 */
export async function generateRestaurantsWithAI(location) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.log('No Gemini API key, using basic fallback')
      return getGenericRestaurants(location)
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const prompt = `Generate a JSON array of 10 popular restaurants in ${location}. 
Include a mix of local cuisine, international options, cafes, and budget/premium restaurants.

For each restaurant provide:
- name: Restaurant name (use real names if you know them, otherwise realistic sounding names)
- cuisine: Cuisine type (e.g., "Italian", "Local Cuisine", "Chinese", "Cafe", "Fast Food")
- rating: Rating out of 5 (be realistic, between 3.5 and 5.0)
- priceForTwo: Average price for two people in INR (range: 200-2000)
- type: "Veg", "Non-Veg", or "Veg & Non-Veg"
- speciality: What they're known for

Return ONLY the JSON array, no other text. Format:
[
  {
    "name": "Restaurant Name",
    "cuisine": "Cuisine Type",
    "rating": "4.3",
    "priceForTwo": 800,
    "type": "Veg & Non-Veg",
    "speciality": "What they're famous for"
  }
]`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const restaurants = JSON.parse(jsonMatch[0])
      console.log(`Generated ${restaurants.length} restaurants for ${location} using AI`)
      return restaurants
    }
    
    throw new Error('Could not parse AI response')
  } catch (error) {
    console.error('Error generating restaurants with AI:', error.message)
    return getGenericRestaurants(location)
  }
}

/**
 * Generate transport options for ANY route using AI
 * @param {string} source - Source city
 * @param {string} destination - Destination city
 * @param {string} date - Travel date
 * @returns {Promise<Array>} Array of transport options
 */
export async function generateTransportWithAI(source, destination, date) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.log('No Gemini API key, using basic fallback')
      return getGenericTransport(source, destination)
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const prompt = `Generate realistic transport options from ${source} to ${destination}.
Consider the distance and geography - provide appropriate transport modes (flight for long distance/international, train/bus for domestic, ferry if coastal/islands).

Provide 8-10 options with a mix of:
- Budget options (government bus, economy train)
- Mid-range options (private bus, 2nd AC train, economy flight)
- Comfort options (luxury bus, 1st AC train, business class flight)

For each option provide:
- mode: "Flight", "Train", "Bus", "Ferry", or "Taxi"
- operator: Realistic operator name
- type: Specific type (e.g., "AC Sleeper", "Express Train", "Economy Flight", "Business Class")
- departureTime: Time in format "HH:MM AM/PM"
- arrivalTime: Time in format "HH:MM AM/PM"
- duration: Travel duration (e.g., "4h", "2h 30m", "12h")
- price: Price in INR (be realistic based on distance and mode)
- rating: Rating out of 5 (between 3.5 and 5.0)
- seatsAvailable: "Available" or "Limited"

Return ONLY the JSON array. Format:
[
  {
    "mode": "Flight",
    "operator": "Airline Name",
    "type": "Economy",
    "departureTime": "09:00 AM",
    "arrivalTime": "11:30 AM",
    "duration": "2h 30m",
    "price": 4500,
    "rating": "4.2",
    "seatsAvailable": "Available"
  }
]`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const transport = JSON.parse(jsonMatch[0])
      console.log(`Generated ${transport.length} transport options for ${source} to ${destination} using AI`)
      return transport
    }
    
    throw new Error('Could not parse AI response')
  } catch (error) {
    console.error('Error generating transport with AI:', error.message)
    return getGenericTransport(source, destination)
  }
}

/**
 * Check if destination is valid/real
 */
export async function validateDestination(destination) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return { valid: true, country: 'Unknown', continent: 'Unknown' }
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const prompt = `Is "${destination}" a real city or tourist destination? 
Return JSON with:
- valid: true/false
- country: Country name (or "Unknown")
- continent: Continent name
- correctedName: Proper spelling/name if misspelled
- message: Brief message if invalid

Return ONLY JSON, no other text.`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    return { valid: true, country: 'Unknown', continent: 'Unknown' }
  } catch (error) {
    return { valid: true, country: 'Unknown', continent: 'Unknown' }
  }
}

// ===== FALLBACK FUNCTIONS (when AI is not available) =====

function getGenericPlaces(destination) {
  return [
    { name: `${destination} City Center`, type: 'Landmark', rating: '4.0', entryFee: 0, duration: '1-2h', description: 'Main city center and downtown area' },
    { name: `${destination} Museum`, type: 'Museum', rating: '4.3', entryFee: 300, duration: '2-3h', description: 'Local history and culture museum' },
    { name: `${destination} Park`, type: 'Park', rating: '4.2', entryFee: 0, duration: '1-2h', description: 'Public park and gardens' },
    { name: `${destination} Old Town`, type: 'Historic Area', rating: '4.5', entryFee: 0, duration: '2-3h', description: 'Historic district' },
    { name: `${destination} Market`, type: 'Shopping', rating: '4.1', entryFee: 0, duration: '1-2h', description: 'Local market and shopping area' },
    { name: `${destination} Temple/Cathedral`, type: 'Religious', rating: '4.4', entryFee: 0, duration: '1h', description: 'Historic religious site' },
    { name: `${destination} Viewpoint`, type: 'Viewpoint', rating: '4.6', entryFee: 100, duration: '1h', description: 'Panoramic city views' },
    { name: `${destination} Art Gallery`, type: 'Museum', rating: '4.2', entryFee: 250, duration: '2h', description: 'Local art gallery' }
  ]
}

function getGenericRestaurants(location) {
  return [
    { name: 'Local Cuisine Restaurant', cuisine: 'Local Cuisine', rating: '4.3', priceForTwo: 800, type: 'Veg & Non-Veg', speciality: 'Traditional dishes' },
    { name: 'International Cafe', cuisine: 'International', rating: '4.4', priceForTwo: 1000, type: 'Veg & Non-Veg', speciality: 'Multi-cuisine' },
    { name: 'Budget Eatery', cuisine: 'Fast Food', rating: '3.9', priceForTwo: 300, type: 'Veg & Non-Veg', speciality: 'Quick meals' },
    { name: 'Fine Dining Restaurant', cuisine: 'Continental', rating: '4.6', priceForTwo: 1800, type: 'Veg & Non-Veg', speciality: 'Gourmet food' },
    { name: 'Pizza & Pasta House', cuisine: 'Italian', rating: '4.2', priceForTwo: 700, type: 'Veg & Non-Veg', speciality: 'Pizza & Pasta' },
    { name: 'Asian Fusion', cuisine: 'Asian', rating: '4.3', priceForTwo: 900, type: 'Veg & Non-Veg', speciality: 'Asian cuisine' },
    { name: 'Coffee House', cuisine: 'Cafe', rating: '4.1', priceForTwo: 400, type: 'Veg', speciality: 'Coffee & Desserts' },
    { name: 'Street Food Corner', cuisine: 'Street Food', rating: '4.0', priceForTwo: 250, type: 'Veg & Non-Veg', speciality: 'Local street food' }
  ]
}

function getGenericTransport(source, destination) {
  // Calculate rough duration based on common routes
  const isInternational = !isIndianCity(source) || !isIndianCity(destination)
  
  if (isInternational) {
    return [
      { mode: 'Flight', operator: 'International Airlines', type: 'Economy', departureTime: '09:00 AM', arrivalTime: '02:00 PM', duration: '5h', price: 25000, rating: '4.2', seatsAvailable: 'Available' },
      { mode: 'Flight', operator: 'Budget Airline', type: 'Economy', departureTime: '11:30 AM', arrivalTime: '04:30 PM', duration: '5h', price: 18000, rating: '4.0', seatsAvailable: 'Available' },
      { mode: 'Flight', operator: 'Premium Airlines', type: 'Business Class', departureTime: '07:00 AM', arrivalTime: '12:00 PM', duration: '5h', price: 65000, rating: '4.7', seatsAvailable: 'Limited' },
      { mode: 'Flight', operator: 'International Airlines', type: 'Economy', departureTime: '03:00 PM', arrivalTime: '08:00 PM', duration: '5h', price: 22000, rating: '4.3', seatsAvailable: 'Available' }
    ]
  }
  
  return [
    { mode: 'Bus', operator: 'Government Transport', type: 'Ordinary', departureTime: '08:00 AM', arrivalTime: '02:00 PM', duration: '6h', price: 350, rating: '3.8', seatsAvailable: 'Available' },
    { mode: 'Bus', operator: 'Private AC Bus', type: 'AC Sleeper', departureTime: '09:00 AM', arrivalTime: '03:00 PM', duration: '6h', price: 800, rating: '4.2', seatsAvailable: 'Available' },
    { mode: 'Train', operator: 'Indian Railways', type: 'Express', departureTime: '07:30 AM', arrivalTime: '01:30 PM', duration: '6h', price: 500, rating: '4.0', seatsAvailable: 'Available' },
    { mode: 'Train', operator: 'Indian Railways', type: 'AC Chair Car', departureTime: '10:00 AM', arrivalTime: '04:00 PM', duration: '6h', price: 900, rating: '4.3', seatsAvailable: 'Available' },
    { mode: 'Flight', operator: 'Domestic Airline', type: 'Economy', departureTime: '06:00 AM', arrivalTime: '07:30 AM', duration: '1h 30m', price: 3500, rating: '4.4', seatsAvailable: 'Limited' },
    { mode: 'Taxi', operator: 'Private Cab', type: 'SUV', departureTime: 'Flexible', arrivalTime: 'Flexible', duration: '5-6h', price: 4500, rating: '4.5', seatsAvailable: 'Available' }
  ]
}

function isIndianCity(city) {
  const indianCities = ['mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'lucknow', 'coimbatore', 'ooty', 'mysore', 'goa', 'kerala', 'kashmir', 'manali', 'shimla']
  return indianCities.some(ic => city.toLowerCase().includes(ic))
}
