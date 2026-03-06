# AI Travel Planner Setup Guide

Your **Autonomous AI Travel Planner** is now ready! 🎉

## 🚀 Quick Start

### 1. Configure Environment Variables

#### Backend Configuration
Edit `backend/.env` and add your actual Supabase credentials:
```env
SUPABASE_URL=https://obdybrhgwqniyssbnrvx.supabase.co
SUPABASE_KEY=your_actual_supabase_anon_key_here
PORT=8000
OPENWEATHER_API_KEY=demo  # Optional: Get from https://openweathermap.org/api
```

#### Frontend Configuration  
Edit `frontend/.env` and add your actual Supabase credentials:
```env
VITE_SUPABASE_URL=https://obdybrhgwqniyssbnrvx.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key_here
```

**🔑 Where to find your Supabase keys:**
1. Go to https://app.supabase.com
2. Open your project
3. Go to Settings → API
4. Copy:
   - Project URL → SUPABASE_URL / VITE_SUPABASE_URL
   - anon/public key → SUPABASE_KEY / VITE_SUPABASE_ANON_KEY

### 2. Start the Servers

#### Start Backend (Terminal 1):
```powershell
cd backend
npm run dev
```
Backend will run on **http://localhost:8000**

#### Start Frontend (Terminal 2):
```powershell
cd frontend
npm run dev
```
Frontend will run on **http://localhost:5173**

### 3. Access the Application

Open your browser and go to: **http://localhost:5173**

## 📋 Features Implemented

### ✅ ChatGPT-Style Dashboard
- Sidebar with navigation (Dashboard, Trip History, Saved Plans, Preferences, Logout)
- Natural language input for trip planning
- Real-time response with trip details
- Beautiful UI with Poppins font and custom color scheme

### ✅ AI Trip Planning Components
- **ChatInput**: Natural language prompt input
- **TripTimeline**: Hour-by-hour itinerary
- **ComparisonTable**: Budget Plan vs Comfort Plan
- **WeatherAdvice**: Real-time weather forecast
- **Checklist**: Smart packing list based on weather & destination

### ✅ Web Scraping (Playwright)
- **Transport Scraper**: RedBus for bus options
- **Places Scraper**: Google Maps/TripAdvisor for attractions
- **Restaurant Scraper**: Zomato recommendations
- All scrapers have fallback data for reliable results

### ✅ Intelligent Services
- **Weather Service**: OpenWeather API integration
- **Crowd Estimator**: Smart crowd prediction based on ratings, day, season
- **Prompt Parser**: Extracts source, destination, budget, duration from natural language
- **Optimizer**: Compares options and generates Budget vs Comfort plans
- **Itinerary Generator**: Creates detailed timeline with times and costs

### ✅ API Endpoints
- `POST /plan-trip` - Main trip planning endpoint
- `GET /sample-prompts` - Get example prompts
- All existing auth endpoints preserved

## 🎯 How to Use

1. **Sign Up/Login** → Redirects to Dashboard
2. **Enter your trip prompt** in natural language:
   - Example: *"Plan a 1 day trip from Ooty to Coimbatore under ₹10000"*
   - Example: *"Weekend getaway to Pondicherry for 2 people, budget ₹15000"*
3. **Get instant AI-powered itinerary** with:
   - Budget Plan vs Comfort Plan comparison
   - Hour-by-hour timeline
   - Weather forecast & recommendations
   - Crowd advice
   - Smart packing checklist

## 🔧 Optional Enhancements

### Get Real Weather Data
1. Sign up at https://openweathermap.org/api (free tier available)
2. Get your API key
3. Add to `backend/.env`:
   ```env
   OPENWEATHER_API_KEY=your_actual_api_key_here
   ```

### Improve Web Scraping
The scrapers currently use Google search as a fallback since some sites block scrapers. For better results:
- The code is ready for direct scraping when sites allow it
- Currently uses intelligent fallback data for Ooty, Coimbatore, and other major cities
- Can be enhanced with:
  - Proxy rotation
  - User-agent rotation
  - Rate limiting
  - API integrations (RedBus API, Zomato API, etc.)

## 📁 Project Structure

```
Trip_Pilot/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── Dashboard.jsx          # Main AI planner interface
│   │   ├── components/
│   │   │   ├── ChatInput.jsx          # Natural language input
│   │   │   ├── TripTimeline.jsx       # Hour-by-hour schedule
│   │   │   ├── ComparisonTable.jsx    # Budget vs Comfort
│   │   │   ├── WeatherAdvice.jsx      # Weather info
│   │   │   └── Checklist.jsx          # Packing list
│   │   └── ...
│   └── .env                            # Frontend config
│
├── backend/
│   ├── routes/
│   │   └── planner.js                  # /plan-trip endpoint
│   ├── scrapers/
│   │   ├── transportScraper.js         # Bus/train options
│   │   ├── placesScraper.js            # Tourist attractions
│   │   └── restaurantScraper.js        # Dining options
│   ├── services/
│   │   ├── weatherService.js           # Weather API
│   │   └── crowdEstimator.js           # Crowd prediction
│   ├── planner/
│   │   ├── promptParser.js             # NLP parsing
│   │   ├── optimizer.js                # Plan comparison
│   │   └── itineraryGenerator.js       # Timeline creation
│   └── .env                            # Backend config
│
└── supabase/
    └── database_schema.sql
```

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Make sure you've added your actual Supabase keys to both `.env` files
- Don't use placeholder text - replace with real keys from Supabase dashboard

### Scrapers returning fallback data
- This is normal! Many sites block automated scraping
- The fallback data for major cities (Ooty, Coimbatore, Chennai, etc.) is comprehensive
- For production, consider using official APIs (RedBus API, Zomato API)

### Weather showing "demo" data
- Add your OpenWeather API key to `backend/.env`
- Free tier allows 1000 calls/day which is plenty for testing

### Port already in use
- Backend uses port 8000
- Frontend uses port 5173
- Stop any existing processes on these ports or change in config

## 🎨 Design Features

- **Cream background** (#F5F1E8) with grid pattern
- **Navy primary** (#4A5899) and **Purple secondary** (#7B68B8)
- **Pastel accents**: Mint, Coral, Purple, Blue
- **Poppins font** family (300-900 weights)
- **SVG icons** throughout (no emojis)
- **Responsive** design with mobile support

## 🚀 Next Steps

1. Add user authentication persistence
2. Save trip plans to database
3. Trip history page
4. Export itinerary as PDF
5. Integration with real booking APIs
6. User preferences (budget style, food type, etc.)
7. Multi-day trip support enhancement
8. Collaborative trip planning
9. Social sharing features

Enjoy your autonomous AI travel planner! 🧳✈️
