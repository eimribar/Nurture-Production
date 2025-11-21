-- NurtureAI Initial Database Schema
-- Run this SQL in Supabase SQL Editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Analysis records table
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_url TEXT,
  primary_reason VARCHAR(100),
  confidence_score DECIMAL(5,2),
  emotional_state VARCHAR(100),
  actionable_steps JSONB,
  medical_disclaimer TEXT,
  analysis_context TEXT,
  chart_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id and created_at for faster user history queries
CREATE INDEX idx_analyses_user_created ON analyses(user_id, created_at DESC);

-- Chat history table
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'model')),
  message TEXT NOT NULL,
  sources JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id and created_at for faster chat history retrieval
CREATE INDEX idx_chat_user_created ON chat_history(user_id, created_at ASC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at for users table
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can only read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can only update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Analyses table policies
-- Users can only read their own analyses
CREATE POLICY "Users can read own analyses" ON analyses
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own analyses
CREATE POLICY "Users can insert own analyses" ON analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own analyses
CREATE POLICY "Users can delete own analyses" ON analyses
  FOR DELETE USING (auth.uid() = user_id);

-- Chat history policies
-- Users can only read their own chat history
CREATE POLICY "Users can read own chat history" ON chat_history
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own chat messages
CREATE POLICY "Users can insert own chat messages" ON chat_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own chat history
CREATE POLICY "Users can delete own chat history" ON chat_history
  FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
-- Note: In Supabase, you'll be using the service role key from your backend
-- which bypasses RLS. These grants are for future use with anon/authenticated roles.
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database schema created successfully!';
  RAISE NOTICE 'Tables created: users, analyses, chat_history';
  RAISE NOTICE 'Indexes created for optimal performance';
  RAISE NOTICE 'Row Level Security policies enabled';
END $$;
