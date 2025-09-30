-- Create meeting_notes table
CREATE TABLE IF NOT EXISTS meeting_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  note_type VARCHAR(50) DEFAULT 'general' CHECK (note_type IN ('general', 'action', 'decision', 'idea', 'issue', 'follow-up')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meeting_notes_meeting_id ON meeting_notes(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_user_id ON meeting_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_note_type ON meeting_notes(note_type);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_priority ON meeting_notes(priority);

-- Create trigger for updated_at
CREATE TRIGGER update_meeting_notes_updated_at BEFORE UPDATE ON meeting_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
