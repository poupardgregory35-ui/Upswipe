-- Add columns for the new 5-step onboarding funnel
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS candidate_diploma TEXT; -- 'DEA', 'Auxiliaire', etc.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS candidate_photo_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS candidate_city TEXT;

-- Step 3: Presentation (one of these is mandatory)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS candidate_cv_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS candidate_video_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS candidate_pitch TEXT; -- 200 char max
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS candidate_presentation_type TEXT CHECK (candidate_presentation_type IN ('cv', 'video', 'text'));

-- Step 4: Terrain / Tags
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS candidate_tags TEXT[]; -- Array of strings e.g. ['Nuit', 'SMUR']

-- Step 5: Activation
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT false;
