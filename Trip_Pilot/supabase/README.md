# Supabase Configuration

This folder contains all Supabase-related database schema and configuration files.

## Files

### `database_schema.sql`
PostgreSQL database schema for the TravelAgent application. This file contains:

- **Tables**:
  - `user_profiles` - Extended user information (username, display name, avatar)
  
- **Features**:
  - UUID primary keys
  - Auto-updating timestamps
  - Row-level security (RLS) policies
  - Foreign key relationships to Supabase Auth users
  - Automatic profile creation on user signup
  - Indexes for query optimization

## Setup Instructions

### Running the Schema

1. Create a new project at [supabase.com](https://supabase.com)
2. Navigate to **SQL Editor** in your Supabase dashboard
3. Click **"New Query"**
4. Copy the entire contents of `database_schema.sql`
5. Paste into the SQL Editor
6. Click **"Run"** to execute

### Verifying Tables

After running the schema, check that tables were created:

1. Go to **Table Editor** in Supabase dashboard
2. You should see:
   - `user_profiles`

### Row-Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can view all profiles (for social features)
- Users can only modify their own profile
- Automatic filtering based on authenticated user ID
- Secure by default

## Database Relationships

```
auth.users (Managed by Supabase Auth)
    └── Email, password, metadata (username, display_name)
    │
    └── user_profiles (one-to-one)
        └── Extended profile info (username, avatar, etc.)
```

## Authentication Flow

1. **User Signs Up**: Email, password, and username provided
2. **Supabase Auth**: Creates entry in `auth.users` with password hash
3. **Auto Trigger**: `handle_new_user()` function automatically creates profile in `user_profiles`
4. **User Metadata**: Username stored in both auth metadata and profiles table

## Environment Variables

- **Frontend**: Uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- **Backend**: Uses `SUPABASE_URL` and `SUPABASE_KEY` (service role)

Get these from: Supabase Dashboard → Settings → API

## Future Additions

This schema is minimal and focused on authentication. Future versions may add:
- Trip history and itinerary tables
- User preferences and settings
- Booking records
- Migration scripts
- Seed data
