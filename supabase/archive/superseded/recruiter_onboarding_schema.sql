-- Recruiter Onboarding Schema
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recruiter_company_type TEXT CHECK (recruiter_company_type IN ('pme', 'smur', 'groupe', 'vsl'));

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recruiter_company_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recruiter_company_city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recruiter_company_phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recruiter_company_email TEXT;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recruiter_needs TEXT[]; -- Array e.g. ['DEA', 'Auxiliaire']
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recruiter_urgency TEXT CHECK (recruiter_urgency IN ('immediate', 'urgent', 'planned'));

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recruiter_onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recruiter_validated BOOLEAN DEFAULT true; -- Default true for now (no SIRET friction)
