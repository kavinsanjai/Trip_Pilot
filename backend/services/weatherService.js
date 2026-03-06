import axios from 'axios'

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || 'demo' // User needs to add their API key

/**
 * Fetch weather forecast for a location
 * @param {string} city - City name
 * @returns {Promise<Object>} Weather information
 */
export async function getWeatherForecast(city) {
  try {
    // OpenWeather API endpoint
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${OPENWEATHER_API_KEY}&units=metric`
    
    console.log(`Fetching weather for ${city}`)
    
    const response = await axios.get(url)
    const data = response.data
    
    return {
      temperature: `${Math.round(data.main.temp)}°C (Feels like ${Math.round(data.main.feels_like)}°C)`,
      conditions: data.weather[0].main,
      description: data.weather[0].description,
      humidity: `${data.main.humidity}%`,
      windSpeed: `${data.wind.speed} m/s`,
      recommendation: getWeatherRecommendation(data.weather[0].main, data.main.temp)
    }
  } catch (error) {
    console.error('Error fetching weather:', error.message)
    
    // Return fallback weather data
    return getFallbackWeather(city)
  }
}

/**
 * Get weather recommendations based on conditions
 */
function getWeatherRecommendation(condition, temp) {
  if (condition === 'Rain' || condition === 'Drizzle') {
    return 'Pack an umbrella and raincoat. Some outdoor activities might be affected.'
  }
  
  if (temp > 35) {
    return 'Very hot weather. Carry sunscreen, hat, and stay hydrated. Plan indoor activities during afternoon.'
  }
  
  if (temp > 30) {
    return 'Warm weather. Wear light cotton clothes and carry a water bottle.'
  }
  
  if (temp < 15) {
    return 'Cool weather. Pack warm clothes like jackets and sweaters.'
  }
  
  if (condition === 'Clear') {
    return 'Perfect weather for sightseeing! Enjoy outdoor activities.'
  }
  
  if (condition === 'Clouds') {
    return 'Pleasant weather with clouds. Good for outdoor activities.'
  }
  
  return 'Check weather updates before outdoor activities.'
}

/**
 * Fallback weather data when API fails
 */
function getFallbackWeather(city) {
  // Approximate weather based on location (very rough)
  const hillStations = ['Ooty', 'Kodaikanal', 'Munnar', 'Shimla', 'Darjeeling']
  const isHillStation = hillStations.some(h => city.toLowerCase().includes(h.toLowerCase()))
  
  if (isHillStation) {
    return {
      temperature: '18°C (Feels like 16°C)',
      conditions: 'Cloudy',
      description: 'partly cloudy',
      humidity: '75%',
      windSpeed: '3.5 m/s',
      recommendation: 'Cool weather. Pack warm clothes like jackets and sweaters.'
    }
  }
  
  return {
    temperature: '28°C (Feels like 30°C)',
    conditions: 'Clear',
    description: 'clear sky',
    humidity: '60%',
    windSpeed: '2.5 m/s',
    recommendation: 'Pleasant weather. Wear light cotton clothes and carry a water bottle.'
  }
}

/**
 * Get weather for multiple cities
 */
export async function getMultiCityWeather(cities) {
  const weatherPromises = cities.map(city => getWeatherForecast(city))
  const results = await Promise.all(weatherPromises)
  
  const weatherMap = {}
  cities.forEach((city, index) => {
    weatherMap[city] = results[index]
  })
  
  return weatherMap
}
