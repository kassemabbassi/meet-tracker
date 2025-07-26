-- Add user_name and password_hash columns to existing meetings table
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS user_name VARCHAR(255) NOT NULL DEFAULT 'default_user';
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT '';

-- Add user_name to participants table for consistency
ALTER TABLE participants ADD COLUMN IF NOT EXISTS user_name VARCHAR(255) NOT NULL DEFAULT 'default_user';

-- Create indexes for better performance with user filtering
CREATE INDEX IF NOT EXISTS idx_meetings_user_name ON meetings(user_name);
CREATE INDEX IF NOT EXISTS idx_participants_user_name ON participants(user_name);

-- Update existing meetings to have a default user (for demo purposes)
UPDATE meetings SET user_name = 'demo_user', password_hash = 'ZGVtbw==' WHERE user_name = 'default_user';
UPDATE participants SET user_name = 'demo_user' WHERE user_name = 'default_user';
