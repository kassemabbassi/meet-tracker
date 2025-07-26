-- Create users table for authentication
CREATE TABLE IF NOT EXISTS app_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add user_id to meetings table (remove password_hash and user_name)
ALTER TABLE meetings DROP COLUMN IF EXISTS password_hash;
ALTER TABLE meetings DROP COLUMN IF EXISTS user_name;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES app_users(id) ON DELETE CASCADE;

-- Add user_id to participants table (remove user_name)
ALTER TABLE participants DROP COLUMN IF EXISTS user_name;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES app_users(id) ON DELETE CASCADE;

-- Drop unnecessary tables
DROP TABLE IF EXISTS meeting_notes CASCADE;
DROP TABLE IF EXISTS mom_emails CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON participants(user_id);

-- Create updated_at trigger for app_users
CREATE TRIGGER update_app_users_updated_at BEFORE UPDATE ON app_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert a demo user for testing (password: "demo123")
INSERT INTO app_users (email, password_hash, display_name) VALUES 
('demo@example.com', '$2b$12$LQv3c1yqBw2LeOI.UKNOSuBxni9.lFqC0G5rIH2F1HMCLrwHnO7C2', 'Demo User')
ON CONFLICT (email) DO NOTHING;
