-- Drop tables if they exist (for clean installation)
DROP TABLE IF EXISTS training_registrations CASCADE;
DROP TABLE IF EXISTS trainings CASCADE;

-- Create trainings table
CREATE TABLE trainings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  objectives TEXT,
  duration VARCHAR(100),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  location VARCHAR(300),
  max_participants INTEGER,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create training registrations table
CREATE TABLE training_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  training_id UUID REFERENCES trainings(id) ON DELETE CASCADE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  education_level VARCHAR(100) NOT NULL,
  training_level VARCHAR(50) NOT NULL CHECK (training_level IN ('beginner', 'intermediate', 'advanced')),
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_trainings_user_id ON trainings(user_id);
CREATE INDEX idx_trainings_status ON trainings(status);
CREATE INDEX idx_trainings_start_date ON trainings(start_date);
CREATE INDEX idx_training_registrations_training_id ON training_registrations(training_id);
CREATE INDEX idx_training_registrations_email ON training_registrations(email);
CREATE INDEX idx_training_registrations_training_level ON training_registrations(training_level);
CREATE INDEX idx_training_registrations_status ON training_registrations(status);

-- Create trigger for updated_at on trainings
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trainings_updated_at 
BEFORE UPDATE ON trainings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for updated_at on training_registrations
CREATE TRIGGER update_training_registrations_updated_at 
BEFORE UPDATE ON training_registrations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE trainings IS 'Stores training/formation sessions created by users';
COMMENT ON TABLE training_registrations IS 'Stores participant registrations for trainings';
COMMENT ON COLUMN training_registrations.education_level IS 'Education level: Bac, Licence, Master, Ingénieur, Doctorat, etc.';
COMMENT ON COLUMN training_registrations.training_level IS 'Participant level in the training: beginner, intermediate, or advanced';
COMMENT ON COLUMN trainings.status IS 'Training status: active (accepting registrations), completed (finished), cancelled';



-- Create training registrations table
CREATE TABLE training_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  training_id UUID REFERENCES trainings(id) ON DELETE CASCADE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  education_specialty VARCHAR(100) NOT NULL CHECK (education_specialty IN (
    'licence_science_info',
    'licence_eea',
    'licence_math_applique',
    'licence_systeme_embarque',
    'licence_tic',
    'cpi',
    'ing_info',
    'ing_micro_electronique',
    'master_recherche_data_science',
    'master_recherche_gl',
    'master_pro_data_science',
    'master_pro_gl',
    'master_recherche_electronique',
    'master_pro_electronique',
    'other'
  )),
  education_level INTEGER NOT NULL CHECK (education_level IN (1, 2, 3)),
  member_type VARCHAR(50) NOT NULL CHECK (member_type IN ('adherent', 'actif')),
  training_level VARCHAR(50) CHECK (training_level IN ('beginner', 'intermediate', 'advanced')),
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Add the new education_specialty column
ALTER TABLE training_registrations
ADD COLUMN education_specialty VARCHAR(100) CHECK (education_specialty IN (
    'licence_science_info',
    'licence_eea',
    'licence_math_applique',
    'licence_systeme_embarque',
    'licence_tic',
    'cpi',
    'ing_info',
    'ing_micro_electronique',
    'master_recherche_data_science',
    'master_recherche_gl',
    'master_pro_data_science',
    'master_pro_gl',
    'master_recherche_electronique',
    'master_pro_electronique',
    'other'
));

-- Add the new member_type column
ALTER TABLE training_registrations
ADD COLUMN member_type VARCHAR(50) CHECK (member_type IN ('adherent', 'actif'));

-- Drop the old CHECK constraint on education_level (if you need to change it to INTEGER)
ALTER TABLE training_registrations
DROP CONSTRAINT IF EXISTS training_registrations_education_level_check;

-- Modify education_level to INTEGER type
ALTER TABLE training_registrations
ALTER COLUMN education_level TYPE INTEGER USING education_level::integer;

-- Add new CHECK constraint for education_level
ALTER TABLE training_registrations
ADD CONSTRAINT training_registrations_education_level_check 
CHECK (education_level IN (1, 2, 3));

-- Drop the NOT NULL constraint on training_level to make it optional
ALTER TABLE training_registrations
ALTER COLUMN training_level DROP NOT NULL;

-- Update existing records to set default values for new columns (optional)
-- UPDATE training_registrations SET education_specialty = 'other' WHERE education_specialty IS NULL;
-- UPDATE training_registrations SET member_type = 'adherent' WHERE member_type IS NULL;