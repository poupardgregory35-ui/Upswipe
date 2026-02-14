-- Create Swipes table
CREATE TABLE IF NOT EXISTS swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  direction TEXT CHECK (direction IN ('left', 'right')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(candidate_id, job_id) -- Prevent duplicate swipes on same job
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_swipes_candidate ON swipes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_swipes_job ON swipes(job_id);

-- Update Applications table to support swipe source
ALTER TABLE applications ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual'; -- 'swipe' or 'manual'
ALTER TABLE applications ADD COLUMN IF NOT EXISTS viewed_by_recruiter BOOLEAN DEFAULT false;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS recruiter_response TEXT CHECK (recruiter_response IN ('interested', 'rejected', NULL));
