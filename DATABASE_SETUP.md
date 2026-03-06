# Database Setup Instructions

## 🗄️ Setting Up Your Supabase Database

To enable **Trip History**, **Saved Plans**, and **Preferences**, you need to run the SQL schema in your Supabase database.

### Steps:

1. **Go to your Supabase Dashboard**
   - Visit https://app.supabase.com
   - Open your project: `obdybrhgwqniyssbnrvx`

2. **Open the SQL Editor**
   - Click on the **SQL Editor** icon in the left sidebar (or go to Database → SQL Editor)

3. **Run the Database Schema**
   - Copy the entire contents of `supabase/database_schema.sql`
   - Paste it into the SQL Editor
   - Click **Run** (or press Ctrl+Enter)

4. **Verify Tables Created**
   - Go to **Database** → **Tables** in the left sidebar
   - You should now see these tables:
     - ✅ `user_profiles` (already exists)
     - ✅ `trips` (new - stores trip history)
     - ✅ `saved_plans` (new - stores saved trips)
     - ✅ `user_preferences` (new - stores travel preferences)

### What This Adds:

#### 📊 Trips Table
Stores every trip you plan with:
- Source, destination, budget, duration
- Full trip plans (budget & comfort)
- Weather advice, crowd info
- Automatically saved when you plan a trip

#### 💾 Saved Plans Table
- Save your favorite trips for later
- Add custom names and notes
- Mark favorites for quick access

#### ⚙️ User Preferences Table
- Budget range preference (budget/moderate/luxury)
- Transport mode (bus/train/flight/any)
- Food preference (veg/non-veg/vegan/any)
- Activity interests (adventure/culture/nature/food)
- Default number of travelers

### API Endpoints Now Available:

Once the database is set up, these endpoints work automatically:

#### Trip History
- `GET /trips` - Get all your past trips
- `GET /trips/:id` - Get specific trip details
- `DELETE /trips/:id` - Delete a trip

#### Saved Plans
- `POST /saved-plans` - Save a trip to favorites
- `GET /saved-plans` - Get all saved plans
- `DELETE /saved-plans/:id` - Remove a saved plan

#### Preferences
- `GET /preferences` - Get your travel preferences
- `PUT /preferences` - Update your preferences

### Testing:

After running the SQL:

1. **Start your servers** (if not already running):
   ```powershell
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Plan a trip** - It will automatically save to your trip history

3. **Click "Trip History"** in the sidebar - Your trips will appear there

4. **Set your preferences** - Customizes future trip recommendations

### Troubleshooting:

**Error: "relation trips does not exist"**
- The SQL hasn't been run yet. Follow steps 1-3 above.

**Error: "permission denied"**
- Make sure you're logged in to Supabase
- The RLS (Row Level Security) policies ensure users only see their own data

**Trips not showing in history**
- Check that you're logged in (auth token must be valid)
- Trip saves happen automatically when planning - no action needed

### Security:

All tables have **Row Level Security (RLS)** enabled:
- Users can only see/edit their own trips
- Each user's data is completely isolated
- Authentication required for all operations

---

**Ready to use!** Once you run the SQL, all trip history, saved plans, and preferences features will work automatically. 🎉
