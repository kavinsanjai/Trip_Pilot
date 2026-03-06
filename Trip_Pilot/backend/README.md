# Backend README

## TravelAgent Backend API - Node.js/Express

A RESTful API server built with Node.js and Express, integrated with Supabase for authentication and database operations.

## 🚀 Tech Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Supabase** - Database and authentication
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📁 Structure

```
backend/
├── config/
│   └── supabase.js         # Supabase client configuration
├── middleware/
│   └── auth.js             # Authentication middleware
├── routes/
│   ├── auth.js             # Authentication endpoints
│   ├── user.js             # User management endpoints
│   └── trip.js             # Trip management endpoints
├── server.js               # Main Express application
├── package.json            # Dependencies and scripts
└── .env.example            # Environment template
```

## 🛠️ Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
# Copy example env file
copy .env.example .env

# Edit .env and add your Supabase credentials
```

Required environment variables:
```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_service_role_key_here
PORT=8000
NODE_ENV=development
```

### 3. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will start on: `http://localhost:8000`

## 📡 API Endpoints

### Authentication (`/auth`)

#### POST `/auth/register`
Register a new user
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### POST `/auth/login`
Login with credentials
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### POST `/auth/logout`
Logout current user (requires authentication)

---

### User Management (`/user`)

All user endpoints require authentication header:
```
Authorization: Bearer <access_token>
```

#### GET `/user/profile`
Get current user profile

#### GET `/user/preferences`
Get user preferences

#### POST `/user/preferences`
Update user preferences
```json
{
  "budget": 5000,
  "preferred_transport": "flight",
  "preferred_hotel_rating": 4,
  "travel_style": "luxury"
}
```

---

### Trip Management (`/trip`)

All trip endpoints require authentication.

#### POST `/trip/create`
Create a new trip
```json
{
  "destination": "Paris, France",
  "start_date": "2026-06-01",
  "end_date": "2026-06-10",
  "itinerary_json": {
    "activities": [],
    "hotels": [],
    "flights": []
  }
}
```

#### GET `/trip/history`
Get all trips for the authenticated user

#### GET `/trip/:id`
Get a specific trip by ID

#### DELETE `/trip/:id`
Delete a trip

---

## 🔐 Authentication

The API uses Supabase Auth with JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🧪 Testing

You can test the API using:
- **cURL**
- **Postman**
- **Thunder Client** (VS Code extension)
- **Your frontend application**

Example cURL request:
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

## 🔄 Development

The backend uses `nodemon` for development, which automatically restarts the server when you make changes to the code.

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| SUPABASE_URL | Your Supabase project URL | Yes |
| SUPABASE_KEY | Supabase service role key | Yes |
| PORT | Server port (default: 8000) | No |
| NODE_ENV | Environment (development/production) | No |

## 🛡️ Error Handling

All endpoints return JSON responses with appropriate HTTP status codes:

- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **404** - Not Found
- **500** - Internal Server Error

Error response format:
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

## 🚀 Deployment

The backend can be deployed to:
- **Render**
- **Railway**
- **Heroku**
- **DigitalOcean**
- **AWS**
- **Vercel** (serverless functions)

Make sure to set environment variables in your deployment platform.

---

Happy coding! 🎉
