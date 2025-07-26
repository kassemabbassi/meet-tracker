-- Create users table for simple user management (no auth)
CREATE TABLE IF NOT EXISTS app_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update meetings table with user isolation and password protection
DROP TABLE IF EXISTS meetings CASCADE;
CREATE TABLE meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  password_hash TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'ended', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update participants table with user isolation
DROP TABLE IF EXISTS participants CASCADE;
CREATE TABLE participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  join_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  speaking_count INTEGER DEFAULT 0,
  last_spoke TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'left')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for complete data isolation
-- Users can only see their own profile
CREATE POLICY "Users can only access their own profile" ON app_users
  FOR ALL USING (id = current_setting('app.current_user_id')::UUID);

-- Users can only access their own meetings
CREATE POLICY "Users can only access their own meetings" ON meetings
  FOR ALL USING (user_id = current_setting('app.current_user_id')::UUID);

-- Users can only access participants from their own meetings
CREATE POLICY "Users can only access their own participants" ON participants
  FOR ALL USING (user_id = current_setting('app.current_user_id')::UUID);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_meeting_id ON participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meetings_name ON meetings(name);
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON meetings(start_time);
CREATE INDEX IF NOT EXISTS idx_participants_name ON participants(name);
CREATE INDEX IF NOT EXISTS idx_app_users_username ON app_users(username);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_app_users_updated_at BEFORE UPDATE ON app_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample users for testing
INSERT INTO app_users (username, display_name) VALUES 
('user1', 'John Doe'),
('user2', 'Jane Smith'),
('user3', 'Mike Johnson')
ON CONFLICT (username) DO NOTHING;
