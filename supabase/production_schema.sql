 -- =================================================================
-- UPSWIPE - SCHÉMA PRODUCTION v1.0
-- Exécuter en PREMIER dans Supabase SQL Editor
-- =================================================================

-- 1. DÉPARTEMENTS
-- =================================================================
CREATE TABLE IF NOT EXISTS departements_france (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  neighbors TEXT[]
);

INSERT INTO departements_france (code, name, region, neighbors) VALUES
('35', 'Ille-et-Vilaine', 'Bretagne', ARRAY['22', '44', '50', '53', '56']),
('22', 'Côtes-d''Armor', 'Bretagne', ARRAY['29', '35', '56']),
('29', 'Finistère', 'Bretagne', ARRAY['22', '56']),
('56', 'Morbihan', 'Bretagne', ARRAY['22', '29', '35', '44']),
('44', 'Loire-Atlantique', 'Pays de la Loire', ARRAY['35', '49', '56', '85']),
('50', 'Manche', 'Normandie', ARRAY['14', '35', '61']),
('53', 'Mayenne', 'Pays de la Loire', ARRAY['35', '49', '61', '72']),
('75', 'Paris', 'Île-de-France', ARRAY['77', '78', '91', '92', '93', '94', '95']),
('13', 'Bouches-du-Rhône', 'Provence-Alpes-Côte d''Azur', ARRAY['04', '30', '83', '84']),
('69', 'Rhône', 'Auvergne-Rhône-Alpes', ARRAY['01', '42', '71'])
ON CONFLICT (code) DO NOTHING;


-- 2. VILLES (Table vide, sera remplie par import_villes.sql)
-- =================================================================
CREATE TABLE IF NOT EXISTS villes_france (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  department_code TEXT REFERENCES departements_france(code),
  is_major BOOLEAN DEFAULT false,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  
  UNIQUE(postal_code, name)
);

CREATE INDEX IF NOT EXISTS idx_villes_name ON villes_france(name);
CREATE INDEX IF NOT EXISTS idx_villes_dept ON villes_france(department_code);
CREATE INDEX IF NOT EXISTS idx_villes_postal ON villes_france(postal_code);


-- 3. PROFILES (Étendre table existante)
-- =================================================================
DO $$ 
BEGIN
  -- Commun
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
    ALTER TABLE profiles ADD COLUMN role TEXT CHECK (role IN ('candidate', 'recruiter'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='city_id') THEN
    ALTER TABLE profiles ADD COLUMN city_id INTEGER REFERENCES villes_france(id);
  END IF;
  
  -- Candidat
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='candidate_diploma') THEN
    ALTER TABLE profiles ADD COLUMN candidate_diploma TEXT CHECK (candidate_diploma IN ('DEA', 'Auxiliaire'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='candidate_city') THEN
    ALTER TABLE profiles ADD COLUMN candidate_city TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='candidate_photo_url') THEN
    ALTER TABLE profiles ADD COLUMN candidate_photo_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='candidate_cv_url') THEN
    ALTER TABLE profiles ADD COLUMN candidate_cv_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='candidate_video_url') THEN
    ALTER TABLE profiles ADD COLUMN candidate_video_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='candidate_pitch') THEN
    ALTER TABLE profiles ADD COLUMN candidate_pitch TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='candidate_presentation_type') THEN
    ALTER TABLE profiles ADD COLUMN candidate_presentation_type TEXT CHECK (candidate_presentation_type IN ('cv', 'video', 'text'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='candidate_tags') THEN
    ALTER TABLE profiles ADD COLUMN candidate_tags TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='candidate_geo_filter') THEN
    ALTER TABLE profiles ADD COLUMN candidate_geo_filter TEXT CHECK (candidate_geo_filter IN ('department', 'region', 'france')) DEFAULT 'region';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='candidate_preferred_cities') THEN
    ALTER TABLE profiles ADD COLUMN candidate_preferred_cities INTEGER[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_available') THEN
    ALTER TABLE profiles ADD COLUMN is_available BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='candidate_onboarding_completed') THEN
    ALTER TABLE profiles ADD COLUMN candidate_onboarding_completed BOOLEAN DEFAULT false;
  END IF;
  
  -- Recruteur
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='recruiter_company_name') THEN
    ALTER TABLE profiles ADD COLUMN recruiter_company_name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='recruiter_company_city') THEN
    ALTER TABLE profiles ADD COLUMN recruiter_company_city TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='recruiter_company_type') THEN
    ALTER TABLE profiles ADD COLUMN recruiter_company_type TEXT CHECK (recruiter_company_type IN ('pme', 'smur', 'groupe', 'vsl'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='recruiter_company_phone') THEN
    ALTER TABLE profiles ADD COLUMN recruiter_company_phone TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='recruiter_company_email') THEN
    ALTER TABLE profiles ADD COLUMN recruiter_company_email TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='recruiter_needs') THEN
    ALTER TABLE profiles ADD COLUMN recruiter_needs TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='recruiter_urgency') THEN
    ALTER TABLE profiles ADD COLUMN recruiter_urgency TEXT CHECK (recruiter_urgency IN ('immediate', 'urgent', 'planned'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='recruiter_onboarding_completed') THEN
    ALTER TABLE profiles ADD COLUMN recruiter_onboarding_completed BOOLEAN DEFAULT false;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_candidate_diploma ON profiles(candidate_diploma) WHERE role = 'candidate';
CREATE INDEX IF NOT EXISTS idx_profiles_available ON profiles(is_available) WHERE role = 'candidate';


-- 4. JOBS
-- =================================================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID REFERENCES profiles(id),
  
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  city_id INTEGER REFERENCES villes_france(id),
  
  required_diplomas TEXT[] NOT NULL CHECK (array_length(required_diplomas, 1) >= 1),
  company_type TEXT NOT NULL CHECK (company_type IN ('pme', 'smur', 'groupe', 'vsl')),
  
  salary INTEGER CHECK (salary >= 1500 AND salary <= 5000),
  type TEXT,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  likes INTEGER DEFAULT 0
);

-- 4b. JOBS UPDATES (Idempotent)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='jobs' AND column_name='is_active') THEN
    ALTER TABLE jobs ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='jobs' AND column_name='views') THEN
    ALTER TABLE jobs ADD COLUMN views INTEGER DEFAULT 0;
  END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='jobs' AND column_name='likes') THEN
    ALTER TABLE jobs ADD COLUMN likes INTEGER DEFAULT 0;
  END IF;
  
  -- Recruiter Dashboard Compatibility
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='jobs' AND column_name='required_license') THEN
    ALTER TABLE jobs ADD COLUMN required_license TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='jobs' AND column_name='city') THEN
    ALTER TABLE jobs ADD COLUMN city TEXT;
  END IF;
END $$;

ALTER TABLE jobs ALTER COLUMN required_diplomas DROP NOT NULL; -- Allow creation without diplomas for now

CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_jobs_diplomas ON jobs USING GIN (required_diplomas);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobs(created_at DESC) WHERE is_active = true;


-- 5. SWIPES
-- =================================================================
CREATE TABLE IF NOT EXISTS swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES profiles(id),
  job_id UUID REFERENCES jobs(id),
  direction TEXT CHECK (direction IN ('left', 'right')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(candidate_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_swipes_candidate ON swipes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_swipes_job ON swipes(job_id);


-- 6. APPLICATIONS
-- =================================================================
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES profiles(id),
  job_id UUID REFERENCES jobs(id),
  source TEXT DEFAULT 'swipe',
  viewed_by_recruiter BOOLEAN DEFAULT false,
  recruiter_response TEXT CHECK (recruiter_response IN ('interested', 'rejected', NULL)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(candidate_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_recruiter ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate ON applications(candidate_id);


-- 7. FONCTION DISTANCE HAVERSINE
-- =================================================================
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL, 
  lng1 DECIMAL,
  lat2 DECIMAL, 
  lng2 DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
  R CONSTANT DECIMAL := 6371;
  dLat DECIMAL;
  dLng DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dLat := RADIANS(lat2 - lat1);
  dLng := RADIANS(lng2 - lng1);
  
  a := SIN(dLat/2) * SIN(dLat/2) +
       COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
       SIN(dLng/2) * SIN(dLng/2);
  
  c := 2 * ATAN2(SQRT(a), SQRT(1-a));
  
  RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- 8. FONCTION MATCHING
-- =================================================================
CREATE OR REPLACE FUNCTION get_swipe_jobs(
  p_candidate_id UUID
)
RETURNS TABLE (
  job_id UUID,
  job_title TEXT,
  company_name TEXT,
  city_name TEXT,
  salary INTEGER,
  distance_km DECIMAL,
  score INTEGER,
  match_level TEXT,
  created_days_ago INTEGER
) AS $$
DECLARE
  v_candidate RECORD;
  v_allowed_depts TEXT[];
BEGIN
  SELECT 
    p.*,
    vc.lat AS candidate_lat,
    vc.lng AS candidate_lng,
    vc.department_code AS candidate_dept,
    d.neighbors AS dept_neighbors
  INTO v_candidate
  FROM profiles p
  JOIN villes_france vc ON p.city_id = vc.id
  LEFT JOIN departements_france d ON vc.department_code = d.code
  WHERE p.id = p_candidate_id
    AND p.role = 'candidate';
  
  CASE v_candidate.candidate_geo_filter
    WHEN 'department' THEN
      v_allowed_depts := ARRAY[v_candidate.candidate_dept];
    WHEN 'region' THEN
      v_allowed_depts := ARRAY[v_candidate.candidate_dept] || COALESCE(v_candidate.dept_neighbors, ARRAY[]::TEXT[]);
    WHEN 'france' THEN
      v_allowed_depts := NULL;
    ELSE
      v_allowed_depts := ARRAY[v_candidate.candidate_dept] || COALESCE(v_candidate.dept_neighbors, ARRAY[]::TEXT[]);
  END CASE;
  
  RETURN QUERY
  SELECT 
    j.id AS job_id,
    j.title AS job_title,
    j.company AS company_name,
    vj.name AS city_name,
    j.salary,
    calculate_distance(
      v_candidate.candidate_lat, 
      v_candidate.candidate_lng, 
      vj.lat, 
      vj.lng
    ) AS distance_km,
    (
      50 +
      CASE 
        WHEN calculate_distance(v_candidate.candidate_lat, v_candidate.candidate_lng, vj.lat, vj.lng) < 5 THEN 25
        WHEN calculate_distance(v_candidate.candidate_lat, v_candidate.candidate_lng, vj.lat, vj.lng) < 15 THEN 15
        WHEN calculate_distance(v_candidate.candidate_lat, v_candidate.candidate_lng, vj.lat, vj.lng) < 30 THEN 10
        ELSE 5
      END +
      CASE 
        WHEN EXTRACT(EPOCH FROM (NOW() - j.created_at)) < 604800 THEN 20
        WHEN EXTRACT(EPOCH FROM (NOW() - j.created_at)) < 2592000 THEN 10
        ELSE 0
      END +
      CASE
        WHEN j.company_type = 'vsl' AND 
             v_candidate.candidate_tags && ARRAY['smur', 'urgences'] 
        THEN -100
        WHEN j.company_type = 'smur' AND 
             v_candidate.candidate_tags && ARRAY['smur', 'urgences', 'nuit']
        THEN 5
        ELSE 0
      END
    )::INTEGER AS score,
    CASE
      WHEN (50 + 
        CASE 
          WHEN calculate_distance(v_candidate.candidate_lat, v_candidate.candidate_lng, vj.lat, vj.lng) < 5 THEN 25
          WHEN calculate_distance(v_candidate.candidate_lat, v_candidate.candidate_lng, vj.lat, vj.lng) < 15 THEN 15
          WHEN calculate_distance(v_candidate.candidate_lat, v_candidate.candidate_lng, vj.lat, vj.lng) < 30 THEN 10
          ELSE 5
        END +
        CASE 
          WHEN EXTRACT(EPOCH FROM (NOW() - j.created_at)) < 604800 THEN 20
          WHEN EXTRACT(EPOCH FROM (NOW() - j.created_at)) < 2592000 THEN 10
          ELSE 0
        END
      ) >= 80 THEN 'perfect'
      WHEN (50 + 
        CASE 
          WHEN calculate_distance(v_candidate.candidate_lat, v_candidate.candidate_lng, vj.lat, vj.lng) < 5 THEN 25
          WHEN calculate_distance(v_candidate.candidate_lat, v_candidate.candidate_lng, vj.lat, vj.lng) < 15 THEN 15
          WHEN calculate_distance(v_candidate.candidate_lat, v_candidate.candidate_lng, vj.lat, vj.lng) < 30 THEN 10
          ELSE 5
        END +
        CASE 
          WHEN EXTRACT(EPOCH FROM (NOW() - j.created_at)) < 604800 THEN 20
          WHEN EXTRACT(EPOCH FROM (NOW() - j.created_at)) < 2592000 THEN 10
          ELSE 0
        END
      ) >= 60 THEN 'good'
      ELSE 'ok'
    END AS match_level,
    EXTRACT(DAY FROM (NOW() - j.created_at))::INTEGER AS created_days_ago
  FROM jobs j
  JOIN villes_france vj ON j.city_id = vj.id
  WHERE 
    j.is_active = true
    AND v_candidate.candidate_diploma = ANY(j.required_diplomas)
    AND (
      v_allowed_depts IS NULL 
      OR vj.department_code = ANY(v_allowed_depts)
    )
    AND (
      v_candidate.candidate_preferred_cities IS NULL
      OR array_length(v_candidate.candidate_preferred_cities, 1) IS NULL
      OR v_candidate.candidate_geo_filter != 'department'
      OR vj.id = ANY(v_candidate.candidate_preferred_cities)
    )
    AND (
      v_candidate.candidate_geo_filter = 'france'
      OR calculate_distance(v_candidate.candidate_lat, v_candidate.candidate_lng, vj.lat, vj.lng) <= 50
    )
    AND NOT EXISTS (
      SELECT 1 FROM swipes s 
      WHERE s.candidate_id = p_candidate_id 
      AND s.job_id = j.id
    )
    AND NOT (
      j.company_type = 'vsl' 
      AND v_candidate.candidate_tags && ARRAY['smur', 'urgences']
    )
  ORDER BY score DESC, j.created_at DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;


-- 9. STORAGE BUCKETS (À créer manuellement dans Supabase Storage)
-- =================================================================
-- candidate-photos (public)
-- candidate-cvs (public)
-- candidate-videos (public)


-- ✅ SCHEMA PRODUCTION TERMINÉ
-- Passer à import_villes.sql pour charger codes postaux
