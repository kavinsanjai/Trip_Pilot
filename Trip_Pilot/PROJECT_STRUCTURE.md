# Project Structure Overview

This document describes the reorganized TravelAgent project structure.

## 📁 Main Folders

The project is now organized into three main folders:

### 1. `frontend/` - React Application
Contains the complete React + Vite frontend application.

**Key Files:**
- `package.json` - Node.js dependencies
- `vite.config.js` - Vite configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `.env.example` - Environment variables template
- `src/` - Source code
  - `components/` - Reusable React components
  - `pages/` - Page components (Landing, Login)
  - `services/` - API and Supabase client services
  - `App.jsx` - Main application with routing
  - `main.jsx` - Application entry point

**To run:**
```powershell
cd frontend
npm install
npm run dev
```

---

### 2. `backend/` - Express Server
Contains the complete Node.js/Express backend server.

**Key Files:**
- `server.js` - Express application entry point
- `package.json` - Node.js dependencies
- `.env.example` - Environment variables template
- `config/` - Configuration files
  - `supabase.js` - Supabase client setup
- `middleware/` - Express middleware
  - `auth.js` - Authentication middleware
- `routes/` - API route handlers
  - `auth.js` - Authentication endpoints
  - `user.js` - User management endpoints
  - `trip.js` - Trip management endpoints

**To run:**
```powershell
cd backend
npm install
npm run dev
```

---

### 3. `supabase/` - Database Configuration
Contains database schema and Supabase-related configuration.

**Key Files:**
- `database_schema.sql` - PostgreSQL schema with tables, RLS policies, indexes
- `README.md` - Supabase setup documentation

**To use:**
1. Create a Supabase project
2. Run `database_schema.sql` in SQL Editor
3. Configure environment variables in both frontend and backend

---

## 🚀 Quick Start

### First Time Setup

1. **Setup Supabase:**
   - Create project at supabase.com
   - Run `supabase/database_schema.sql`
   - Get API credentials

2. **Setup Frontend:**
   ```powershell
   cd frontend
   npm install
   copy .env.example .env
   # Edit .env with Supabase credentials
   npm run dev
   ```

3. **Setup Backend:**
   ```powershell
   cd backend
   npm install
   copy .env.example .env
   # Edit .env with Supabase credentials
   npm run dev
   ```

---

## 🔗 URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 📝 Environment Variables

### Frontend (`frontend/.env`)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=http://localhost:8000
```

### Backend (`backend/.env`)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_service_role_key
```

---

## 📚 Documentation

- [README.md](README.md) - Complete project documentation
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed setup instructions
- [supabase/README.md](supabase/README.md) - Database documentation

---

## 🎯 Benefits of This Structure

✅ **Separation of Concerns** - Frontend, backend, and database are clearly separated
✅ **Independent Development** - Work on each part independently
✅ **Easy Deployment** - Deploy frontend and backend to different services
✅ **Clean Organization** - Easy to navigate and understand
✅ **Scalable** - Ready for team collaboration

---

## 🔄 Migration from Old Structure

If you had the old structure, files were moved as follows:

**Old Location** → **New Location**
- `src/` → `frontend/src/`
- `public/` → `frontend/public/`
- `package.json` → `frontend/package.json`
- `vite.config.js` → `frontend/vite.config.js`
- `.env.example` → `frontend/.env.example`
- `backend/` → `backend/` (stayed the same, just changed from Python to Node.js)
- `database_schema.sql` → `supabase/database_schema.sql`

---

Happy coding! 🚀
