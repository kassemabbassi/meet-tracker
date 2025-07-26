-- Enable Row Level Security and create user-specific tables
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Add user_id column to meetings table
ALTER TABLE meetings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE meetings ADD COLUMN password_hash TEXT NOT NULL;

-- Add user_id to participants table (inherited from meeting)
ALTER TABLE participants ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create meeting_notes table for MoM functionality
CREATE TABLE IF NOT EXISTS meeting_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  note_type VARCHAR(50) NOT NULL CHECK (note_type IN ('general', 'action', 'objective', 'decision', 'issue')),
  content TEXT NOT NULL,
  assigned_to_email VARCHAR(255), -- For action items
  assigned_to_name VARCHAR(255), -- For action items
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mom_emails table to track sent emails
CREATE TABLE IF NOT EXISTS mom_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  email_type VARCHAR(50) NOT NULL CHECK (email_type IN ('full_mom', 'action_items')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_status VARCHAR(20) DEFAULT 'sent' CHECK (email_status IN ('sent', 'failed', 'pending'))
);

-- Row Level Security Policies
-- Meetings: Users can only see their own meetings
CREATE POLICY "Users can only access their own meetings" ON meetings
  FOR ALL USING (auth.uid() = user_id);

-- Participants: Users can only see participants from their meetings
CREATE POLICY "Users can only access participants from their meetings" ON participants
  FOR ALL USING (auth.uid() = user_id);

-- Meeting Notes: Users can only access notes from their meetings
CREATE POLICY "Users can only access their own meeting notes" ON meeting_notes
  FOR ALL USING (auth.uid() = user_id);

-- MoM Emails: Users can only see their own email records
CREATE POLICY "Users can only access their own email records" ON mom_emails
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON participants(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_meeting_id ON meeting_notes(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_user_id ON meeting_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_mom_emails_meeting_id ON mom_emails(meeting_id);

-- Create updated_at trigger for meeting_notes
CREATE TRIGGER update_meeting_notes_updated_at BEFORE UPDATE ON meeting_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
