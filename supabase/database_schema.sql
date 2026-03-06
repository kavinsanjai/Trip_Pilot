-- TravelAgent Database Schema
-- Supabase (PostgreSQL) Database Setup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table is automatically managed by Supabase Auth (auth.users)
-- This stores email, password hash, and metadata (username, display_name)

-- User Profiles Table
-- Stores additional user information linked to auth.users
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view all profiles"
    ON user_profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON user_profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
    ON user_profiles FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Function to automatically create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, username, email, display_name)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        new.email,
        COALESCE(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
    );
    RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger to create profile automatically on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- TRIP MANAGEMENT TABLES
-- ========================================

-- Trip History Table
-- Stores all trips that users have planned
CREATE TABLE IF NOT EXISTS trips (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    source VARCHAR(100),
    destination VARCHAR(100) NOT NULL,
    budget INTEGER,
    duration INTEGER NOT NULL,
    travelers INTEGER DEFAULT 1,
    trip_date DATE,
    
    -- Trip plan data (stored as JSONB for flexibility)
    budget_plan JSONB,
    comfort_plan JSONB,
    comparison_table JSONB,
    weather_advice JSONB,
    crowd_advice TEXT,
    things_required JSONB,
    
    -- Metadata
    recommended_plan VARCHAR(20),
    total_cost_budget INTEGER,
    total_cost_comfort INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Saved Plans Table
-- Stores trips that users want to save for future reference
CREATE TABLE IF NOT EXISTS saved_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    plan_name VARCHAR(200) NOT NULL,
    notes TEXT,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, trip_id)
);

-- User Preferences Table
-- Stores user travel preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Travel preferences
    preferred_budget_range VARCHAR(50), -- 'budget', 'moderate', 'luxury'
    preferred_transport_mode VARCHAR(50), -- 'bus', 'train', 'flight', 'any'
    food_preference VARCHAR(50), -- 'veg', 'non-veg', 'vegan', 'any'
    accommodation_type VARCHAR(50), -- 'budget', 'mid-range', 'luxury'
    
    -- Activity preferences (stored as array)
    activity_interests TEXT[], -- ['adventure', 'relaxation', 'culture', 'nature', 'food']
    
    -- Default settings
    default_travelers INTEGER DEFAULT 1,
    currency VARCHAR(10) DEFAULT 'INR',
    preferred_language VARCHAR(10) DEFAULT 'en',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_destination ON trips(destination);
CREATE INDEX IF NOT EXISTS idx_trips_trip_date ON trips(trip_date);
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON trips(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_saved_plans_user_id ON saved_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_plans_trip_id ON saved_plans(trip_id);
CREATE INDEX IF NOT EXISTS idx_saved_plans_is_favorite ON saved_plans(is_favorite);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Apply updated_at triggers
CREATE TRIGGER update_trips_updated_at
    BEFORE UPDATE ON trips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_plans_updated_at
    BEFORE UPDATE ON saved_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies for Trips
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trips"
    ON trips FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trips"
    ON trips FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips"
    ON trips FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips"
    ON trips FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Row Level Security (RLS) Policies for Saved Plans
ALTER TABLE saved_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved plans"
    ON saved_plans FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved plans"
    ON saved_plans FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved plans"
    ON saved_plans FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved plans"
    ON saved_plans FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Row Level Security (RLS) Policies for User Preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
    ON user_preferences FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
    ON user_preferences FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
    ON user_preferences FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
    ON user_preferences FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
