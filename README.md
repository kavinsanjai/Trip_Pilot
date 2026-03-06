# TravelAgent – Automated Trip Planner & Booking Assistant

An AI-powered full-stack web application that autonomously plans your entire trip by navigating travel websites and generating optimized itineraries.

## 🚀 Tech Stack

### Frontend
- **React** (Vite)
- **Tailwind CSS** - Modern, responsive UI
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Supabase Auth** - Authentication

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Fast, minimalist web framework
- **Supabase JS Client** - Database integration
- **JWT Authentication** - Secure token-based auth

### Database
- **Supabase** (PostgreSQL)
- Row-level security enabled
- Auto-updating timestamps

## 📁 Project Structure

```
Trip_Pilot/
├── frontend/                     # React Vite application
│   ├── src/                     # Source code
│   │   ├── components/          # React components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── FeatureCard.jsx
│   │   │   └── LoginForm.jsx
│   │   ├── pages/               # Page components
│   │   │   ├── Landing.jsx
│   │   │   └── Login.jsx
│   │   ├── services/            # API & Auth services
│   │   │   ├── supabaseClient.js
│   │   │   └── api.js
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── public/                  # Static assets
│   ├── package.json             # Node dependencies
│   ├── vite.config.js           # Vite configuration
│   ├── tailwind.config.js       # Tailwind CSS config
│   └── .env.example             # Frontend env template
├── backend/                      # Express backend
│   ├── config/                  # Configuration
│   │   └── supabase.js         # Supabase client
│   ├── middleware/              # Express middleware
│   │   └── auth.js             # Authentication middleware
│   ├── routes/                  # API routes
│   │   ├── auth.js             # Authentication endpoints
│   │   ├── user.js             # User profile & preferences
│   │   └── trip.js             # Trip management
│   ├── server.js                # Express app entry
│   ├── package.json             # Node dependencies
│   └── .env.example             # Backend env template
└── supabase/                     # Database & Supabase config
    └── database_schema.sql      # PostgreSQL schema
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Supabase account

### 1️⃣ Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/database_schema.sql`
3. Enable **Google OAuth** in Authentication > Providers (optional)
4. Get your credentials from Settings > API:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY` (for frontend)
   - `SUPABASE_SERVICE_ROLE_KEY` (for backend)

### 2️⃣ Frontend Setup

```powershell
# Navigate to frontend folder
cd C:\Users\skkav\OneDrive\Documents\GitHub\Trip_Pilot\Trip_Pilot\frontend

# Install dependencies
npm install

# Create environment file
copy .env.example .env

# Edit .env with your Supabase credentials
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_anon_key

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### 3️⃣ Backend Setup

```powershell
# Navigate to backend folder
cd C:\Users\skkav\OneDrive\Documents\GitHub\Trip_Pilot\Trip_Pilot\backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env

# Edit .env with your Supabase credentials
# SUPABASE_URL=your_supabase_url
# SUPABASE_KEY=your_service_role_key

# Run the development server
npm run dev
```

Backend API will be available at: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

## 🗄️ Database Schema

### Tables

#### `users` (Managed by Supabase Auth)
- Authentication and user management

#### `user_preferences`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| budget | DECIMAL | Travel budget |
| preferred_transport | VARCHAR | e.g., "flight", "train" |
| preferred_hotel_rating | INTEGER | 1-5 stars |
| travel_style | VARCHAR | e.g., "luxury", "budget" |

#### `trip_history`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| destination | VARCHAR | Trip destination |
| start_date | DATE | Trip start |
| end_date | DATE | Trip end |
| itinerary_json | JSONB | Full itinerary data |

## 🔌 API Endpoints

### Authentication
- `POST /auth/login` - Login with email/password
- `POST /auth/register` - Create new account

### User Management
- `GET /user/profile` - Get user profile
- `GET /user/preferences` - Get user preferences
- `POST /user/preferences` - Update preferences

### Trip Management
- `POST /trip/create` - Create new trip
- `GET /trip/history` - Get all user trips

## 🎨 Features

### ✅ Completed
- Responsive landing page with hero section
- Feature showcase cards
- Split-screen login page
- Supabase authentication (email + Google OAuth ready)
- User profile and preferences management
- Trip history tracking
- Tailwind CSS styling with modern design
- FastAPI backend with CORS support
- Full REST API implementation

### 🚧 Future Enhancements
- AI agent integration for automated travel search
- WebSocket streaming for real-time updates
- Flight/hotel booking integration
- Itinerary optimization engine
- Multi-platform travel data aggregation
- Payment processing
- Trip sharing features

## 🔐 Environment Variables

### Frontend (`.env`)
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_API_BASE_URL=http://localhost:8000
```

### Backend (`backend/.env`)
```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_service_role_key_here
```

## 🚀 Running the Application

### Development Mode

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

### Production Build

```powershell
# Build frontend
npm run build

# Preview production build
npm run preview
```

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Author

Created as part of the TravelAgent AI Project

---

**Happy Traveling! ✈️🌍**
