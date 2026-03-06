# 🚀 TravelAgent - Quick Setup Guide

Follow these steps to get your TravelAgent application up and running!

## 📋 Prerequisites Checklist

- [ ] Node.js v18+ installed ([Download](https://nodejs.org/))
- [ ] npm (comes with Node.js)
- [ ] Git installed ([Download](https://git-scm.com/))
- [ ] Supabase account created ([Sign up](https://supabase.com))
- [ ] Code editor (VS Code recommended)

---

## Step 1: Supabase Database Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: TravelAgent
   - **Database Password**: (create a strong password - save it!)
   - **Region**: Choose closest to you
4. Click **"Create new project"** (wait 2-3 minutes)

### 1.2 Run Database Schema

1. In your Supabase project, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Open `supabase/database_schema.sql` from your project folder
4. Copy ALL the content and paste into the SQL Editor
5. Click **"Run"** (you should see "Success" messages)

### 1.3 Get Your API Credentials

1. Click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"** in the settings menu
3. Copy these values (you'll need them soon):
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys") - click "Reveal"

### 1.4 Enable Google OAuth (Optional)

1. Go to **"Authentication"** → **"Providers"**
2. Find **"Google"** and toggle it on
3. Follow the Google Cloud Console setup instructions
4. Add your OAuth credentials

---

## Step 2: Frontend Setup

### 2.1 Install Dependencies

Open PowerShell in your project directory:

```powershell
# Navigate to frontend folder
cd C:\Users\skkav\OneDrive\Documents\GitHub\Trip_Pilot\Trip_Pilot\frontend

# Install packages (this takes 1-2 minutes)
npm install
```

### 2.2 Configure Environment Variables

```powershell
# Create .env file from template
copy .env.example .env

# Open .env in your editor
notepad .env
```

Replace the placeholders with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key_here
VITE_API_BASE_URL=http://localhost:8000
```

**Save and close** the file.

### 2.3 Test Frontend

```powershell
# Start development server
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your browser to `http://localhost:5173` - you should see the landing page!

**Keep this terminal running** and open a new one for the backend.

---

## Step 3: Backend Setup

### 3.1 Install Backend Dependencies

Open a **NEW PowerShell terminal**:

```powershell
# Navigate to backend folder
cd C:\Users\skkav\OneDrive\Documents\GitHub\Trip_Pilot\Trip_Pilot\backend

# Install Node.js packages (takes 1-2 minutes)
npm install
```

### 3.2 Configure Backend Environment

```powershell
# Create .env file
copy .env.example .env

# Open it in editor
notepad .env
```

Add your Supabase credentials:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_service_role_key_here
PORT=8000
NODE_ENV=development
```

**Important**: Use the **service_role** key here, not the anon key!

**Save and close** the file.

### 3.3 Start Backend Server

```powershell
# Still in backend folder
npm run dev
```

You should see:
```
🚀 TravelAgent API Server running on http://localhost:8000
📊 Health check: http://localhost:8000/health
```

Test it: Open `http://localhost:8000/health` in your browser - you'll see the health status!

---

## Step 4: Test the Full Application

### 4.1 Verify Both Servers Are Running

- **Terminal 1**: Frontend on `http://localhost:5173` (from `frontend/` folder)
- **Terminal 2**: Backend on `http://localhost:8000` (from `backend/` folder)

### 4.2 Test the Landing Page

1. Open `http://localhost:5173`
2. You should see:
   - ✈️ TravelAgent logo
   - "Plan Your Entire Trip in Seconds" hero
   - 4 feature cards
   - Footer

### 4.3 Test Authentication

1. Click **"Login"** button (top right)
2. You'll see the split-screen login page
3. Click **"Sign Up"** link
4. Try creating an account with:
   - Email: `test@example.com`
   - Password: `Test123456!`

**Note**: For now, auth only works if you've set up Supabase correctly. If there's an error, check your environment variables!

### 4.4 Test API Endpoints

Open `http://localhost:8000/docs` and try:

1. Expand **POST /auth/register**
2. Click **"Try it out"**
3. Enter:
   ```json
   {
     "email": "api-test@example.com",
     "password": "SecurePass123!"
   }
   ```
4. Click **"Execute"**
5. You should get a 200 response with user data!

---

## Step 5: Development Workflow

### Daily Startup

**Terminal 1 - Frontend:**
```powershell
cd C:\Users\skkav\OneDrive\Documents\GitHub\Trip_Pilot\Trip_Pilot\frontend
npm run dev
```

**Terminal 2 - Backend:**
```powershell
cd C:\Users\skkav\OneDrive\Documents\GitHub\Trip_Pilot\Trip_Pilot\backend
npm run dev
```

### Making Changes

- **Frontend changes**: Vite will auto-reload the browser (in `frontend/` folder)
- **Backend changes**: Nodemon will auto-restart the server (in `backend/` folder)

---

## 🎉 Success Checklist

You're ready to develop when:

- [ ] Frontend loads at `http://localhost:5173`
- [ ] Landing page displays correctly with all components
- [ ] Login page works and looks good
- [ ] Backend API docs load at `http://localhost:8000/docs`
- [ ] Can register a test user via API or UI
- [ ] No console errors in browser DevTools

---

## 🐛 Common Issues & Solutions

### Issue: "npm: command not found" or "node: command not found"
**Solution**: Install Node.js from [nodejs.org](https://nodejs.org/) and restart your terminal

### Issue: Frontend loads but can't connect to backend
**Solution**: 
1. Check backend is running on port 8000
2. Verify `VITE_API_BASE_URL=http://localhost:8000` in frontend `.env`
3. Restart both servers

### Issue: Supabase authentication errors
**Solution**:
1. Double-check your `.env` files have correct credentials
2. Verify you copied the right keys (anon for frontend, service_role for backend)
3. Check Supabase project is active in dashboard

### Issue: "Module not found" errors
**Solution**:
- Frontend: `cd frontend` and run `npm install`
- Backend: `cd backend` and run `npm install`

---

## 📚 Next Steps

Once everything is working:

1. **Customize the UI**: Edit components in `frontend/src/components/`
2. **Add new pages**: Create files in `frontend/src/pages/` and add routes
3. **Extend the API**: Add endpoints in `backend/routes/`
4. **Add trip planning logic**: Start building the AI agent features!

---

## 🆘 Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- FastAPI docs: [fastapi.tiangolo.com](https://fastapi.tiangolo.com/)
- React Router docs: [reactrouter.com](https://reactrouter.com/)

Happy coding! 🚀✈️
