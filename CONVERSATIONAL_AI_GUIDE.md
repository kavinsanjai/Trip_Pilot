# Conversational AI Setup Guide

Your chatbot is now upgraded to handle **any type of message** - not just predefined trip planning prompts!

## 🎯 What Changed

Your TravelAgent chatbot can now:

✅ **Answer general travel questions**
- "What's the best time to visit Kerala?"
- "How much does a trip to Goa usually cost?"
- "What are popular tourist spots in Ooty?"

✅ **Have casual conversations**
- "Hello!"
- "Can you help me plan a trip?"
- "Tell me about yourself"

✅ **Handle partial information**
- "I want to visit Ooty" → Bot will ask for duration, budget, etc.
- "Plan a 2-day trip" → Bot will ask for destination

✅ **Complete trip planning** (as before)
- "Plan a 2 day trip from Chennai to Ooty under ₹15000"

## 🔧 Setup Instructions

### Step 1: Get Free Gemini API Key

1. Visit: https://makersuite.google.com/app/apikey (or https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Step 2: Add to Environment Variables

1. Open `backend/.env` file (create if it doesn't exist)
2. Add this line:
```
GEMINI_API_KEY=your_actual_api_key_here
```

Example:
```
SUPABASE_URL=https://obdybrhgwqniyssbnrvx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiI...
GEMINI_API_KEY=AIzaSyD1234567890abcdefghijklmnop
```

### Step 3: Restart Backend Server

```bash
cd backend
npm run dev
```

## 📝 How It Works

### 1. **Intent Classification**
The bot automatically detects what type of message you sent:

- **`trip_planning`** - You want to plan a trip
- **`question`** - You asked a travel-related question  
- **`casual`** - General conversation

### 2. **Smart Response**

**Conversational Messages:**
```json
{
  "type": "conversation",
  "message": "The best time to visit Kerala is from September to March..."
}
```

**Needs More Info:**
```json
{
  "type": "clarification", 
  "message": "I'd love to help plan your trip to Ooty! How many days are you planning to stay?"
}
```

**Full Trip Plan:**
```json
{
  "type": "trip_plan",
  "budget_plan": {...},
  "comfort_plan": {...},
  "trip_summary": {...}
}
```

### 3. **Conversation Memory**
The chatbot remembers the last 10 messages, so you can have a natural back-and-forth:

```
You: I want to visit Ooty
Bot: Great choice! How many days are you planning?
You: 2 days
Bot: Perfect! What's your budget?
You: Under ₹15000
Bot: And where will you be traveling from?
You: Chennai
Bot: [Creates full trip plan]
```

## 🧪 Testing Examples

Try these in your chatbot:

### General Questions
```
- "What are the best hill stations near Chennai?"
- "How much does food cost in Ooty?"
- "Is Coimbatore good for families?"
```

### Partial Trip Planning
```
- "I want to visit Mysore"
- "Plan a trip under ₹10000"
- "I have 3 days for a vacation"
```

### Full Trip Planning
```
- "Plan a 2 day trip from Chennai to Ooty under ₹15000"
- "Create itinerary from Bangalore to Coorg for 3 days with ₹25000 budget"
```

### Casual Chat
```
- "Hello!"
- "What can you do?"
- "Thanks for the help!"
```

## 🎨 Frontend Updates

The Dashboard now:
- Sends conversation history with each message
- Handles different response types (conversation, clarification, trip plan)
- Shows text responses differently from trip plans

## 🚫 Without API Key

If you don't add the Gemini API key:
- Trip planning still works normally
- General questions get a friendly fallback message
- You'll be prompted to provide specific trip details

## ⚡ Performance Notes

- **Gemini API** is FREE (with generous limits)
- First response might take 2-3 seconds
- Trip planning still uses the same fast scrapers
- Conversation history limited to last 10 messages for efficiency

## 📦 New Files Added

1. `backend/services/conversationalAI.js` - AI conversation handler
2. `CONVERSATIONAL_AI_GUIDE.md` - This guide

## 🛠️ Technical Details

The system uses:
- **Google Gemini 1.5 Flash** - Fast, free generative AI
- **Intent classification** - Rule-based + AI hybrid
- **Parameter extraction** - NLP to extract trip details
- **Conversation context** - Last 10 messages for continuity

---

Need help? Check the console logs for debugging or ask your bot: "Help me plan a trip!"
