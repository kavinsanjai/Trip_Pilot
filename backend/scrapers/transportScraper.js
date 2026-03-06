import { chromium } from 'playwright'
import { generateTransportWithAI } from '../services/aiDataGenerator.js'

/**
 * Scrape transportation options - AI-powered for ANY route worldwide
 * @param {string} source - Source city
 * @param {string} destination - Destination city
 * @param {string} date - Travel date (YYYY-MM-DD format)
 * @returns {Promise<Array>} Array of transport options
 */
export async function scrapeTransportOptions(source, destination, date) {
  console.log(`Fetching transport options: ${source} → ${destination}...`)
  
  // Try AI generation first (works for ANY route)
  try {
    const aiTransport = await generateTransportWithAI(source, destination, date)
    if (aiTransport && aiTransport.length > 0) {
      console.log(`✓ Generated ${aiTransport.length} transport options using AI`)
      return aiTransport
    }
  } catch (error) {
    console.log('AI generation failed, trying web scraping...')
  }
  
  // Fallback to web scraping
  return await scrapeFromWeb(source, destination, date)
}

/**
 * Web scraping fallback method
 */
async function scrapeFromWeb(source, destination, date) {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  
  const transportOptions = []

  try {
    // Format date for RedBus (DD-MMM-YYYY like "25-Jan-2025")
    const dateObj = new Date(date)
    const formattedDate = dateObj.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }).replace(/ /g, '-')

    // RedBus URL format
    const redBusUrl = `https://www.redbus.in/bus-tickets/${source.toLowerCase()}-to-${destination.toLowerCase()}?fromCityName=${source}&fromCityId=&toCityName=${destination}&toCityId=&onward=${formattedDate}`
    
    console.log(`Scraping RedBus: ${redBusUrl}`)
    
    await page.goto(redBusUrl, { waitUntil: 'networkidle', timeout: 30000 })
    
    // Wait for bus results to load
    await page.waitForSelector('.button', { timeout: 10000 }).catch(() => {
      console.log('No bus results found on RedBus')
    })

    // Extract bus information
    const buses = await page.$$eval('.bus-items', (items) => {
      return items.slice(0, 10).map(item => {
        const name = item.querySelector('.travels')?.textContent?.trim() || ''
        const type = item.querySelector('.bus-type')?.textContent?.trim() || ''
        const departureTime = item.querySelector('.dp-time')?.textContent?.trim() || ''
        const arrivalTime = item.querySelector('.bp-time')?.textContent?.trim() || ''
        const duration = item.querySelector('.dur')?.textContent?.trim() || ''
        const price = item.querySelector('.fare')?.textContent?.trim().replace(/[^\d]/g, '') || '0'
        const rating = item.querySelector('.rating')?.textContent?.trim() || 'N/A'
        const seatsAvailable = item.querySelector('.seat-left')?.textContent?.trim() || 'N/A'

        return {
          mode: 'Bus',
          operator: name,
          type: type,
          departureTime: departureTime,
          arrivalTime: arrivalTime,
          duration: duration,
          price: parseInt(price, 10) || 0,
          rating: rating,
          seatsAvailable: seatsAvailable
        }
      })
    }).catch(() => [])

    transportOptions.push(...buses)

  } catch (error) {
    console.error('Error scraping transport options:', error.message)
  } finally {
    await browser.close()
  }

  // If no results found, return mock data for testing
  if (transportOptions.length === 0) {
    console.log('No real transport data found, using fallback data')
    return [
      {
        mode: 'Bus',
        operator: 'Government Bus',
        type: 'Ordinary',
        departureTime: '08:00 AM',
        arrivalTime: '12:00 PM',
        duration: '4h',
        price: 150,
        rating: '3.8',
        seatsAvailable: 'Available'
      },
      {
        mode: 'Bus',
        operator: 'Private AC',
        type: 'AC Sleeper',
        departureTime: '09:00 AM',
        arrivalTime: '01:00 PM',
        duration: '4h',
        price: 450,
        rating: '4.2',
        seatsAvailable: 'Available'
      },
      {
        mode: 'Train',
        operator: 'Indian Railways',
        type: 'Express',
        departureTime: '07:30 AM',
        arrivalTime: '11:30 AM',
        duration: '4h',
        price: 200,
        rating: '4.0',
        seatsAvailable: 'RAC'
      }
    ]
  }

  return transportOptions
}

/**
 * Find cheapest transport option
 */
export function findCheapestTransport(options) {
  if (!options || options.length === 0) return null
  return options.reduce((min, option) => 
    option.price < min.price ? option : min
  )
}

/**
 * Find most comfortable transport option (highest rated & most expensive)
 */
export function findComfortTransport(options) {
  if (!options || options.length === 0) return null
  
  // Sort by rating (descending) and price (descending)
  const sorted = [...options].sort((a, b) => {
    const ratingA = parseFloat(a.rating) || 0
    const ratingB = parseFloat(b.rating) || 0
    if (ratingB !== ratingA) return ratingB - ratingA
    return b.price - a.price
  })
  
  return sorted[0]
}
