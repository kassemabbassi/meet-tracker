-- Create training collaborators table
CREATE TABLE IF NOT EXISTS training_collaborators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  training_id UUID REFERENCES trainings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  collaborator_email VARCHAR(255) NOT NULL,
  added_by_user_id UUID NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(training_id, collaborator_email)
);

-- Create indexes for better performance
CREATE INDEX idx_training_collaborators_training_id ON training_collaborators(training_id);
CREATE INDEX idx_training_collaborators_user_id ON training_collaborators(user_id);
CREATE INDEX idx_training_collaborators_email ON training_collaborators(collaborator_email);

-- Add comments for documentation
COMMENT ON TABLE training_collaborators IS 'Stores collaborators who can manage trainings together';
COMMENT ON COLUMN training_collaborators.training_id IS 'The training being shared';
COMMENT ON COLUMN training_collaborators.user_id IS 'The user ID of the creator (for reference)';
COMMENT ON COLUMN training_collaborators.collaborator_email IS 'Email of the collaborator';
COMMENT ON COLUMN training_collaborators.added_by_user_id IS 'Who added this collaborator';
