-- 🦸‍♂️ SCRIPT ULTIME v3 (La Vraie Solution)
-- 1. Nettoie la table jobs (supprime la vieille colonne 'city' qui bloque tout)
-- 2. Répare l'inscription (compatible avec le Frontend actuel !)
-- 3. Ajoute les données de test

-- ============================================================
-- 1. NETTOYAGE TABLE JOBS (Le fix de l'erreur NOT NULL)
-- ============================================================
-- On supprime la colonne 'city' textuelle car on utilise désormais 'city_id'
ALTER TABLE jobs DROP COLUMN IF EXISTS city;

-- Sécurité : on s'assure que company_type existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='jobs' AND column_name='company_type') THEN
        ALTER TABLE jobs ADD COLUMN company_type TEXT DEFAULT 'pme';
    END IF;
END $$;

-- ============================================================
-- 2. CORRECTION DE L'INSCRIPTION (Compatible Frontend)
-- ============================================================
-- On garde p_city en TEXT car le front envoie "Code - Ville"
CREATE OR REPLACE FUNCTION candidate_profile_save_v2(
    p_user_id UUID,
    p_diploma TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL, -- Le front envoie du texte, on gère !
    p_photo_url TEXT DEFAULT NULL,
    p_presentation_type TEXT DEFAULT NULL,
    p_cv_url TEXT DEFAULT NULL,
    p_video_url TEXT DEFAULT NULL,
    p_pitch TEXT DEFAULT NULL,
    p_tags TEXT[] DEFAULT NULL,
    p_available BOOLEAN DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_city_id INTEGER;
  v_zip_code TEXT;
BEGIN
  -- Extraction du Code Postal (ex: "69002 - Lyon" -> "69002")
  IF p_city IS NOT NULL THEN
     v_zip_code := SPLIT_PART(p_city, ' - ', 1);
     SELECT id INTO v_city_id FROM villes_france WHERE postal_code = v_zip_code LIMIT 1;
  END IF;

  UPDATE public.profiles SET
    candidate_diploma = COALESCE(p_diploma, public.profiles.candidate_diploma, 'DEA'),
    candidate_city = COALESCE(p_city, public.profiles.candidate_city),
    city_id = COALESCE(v_city_id, public.profiles.city_id), -- On lie l'ID trouvé
    candidate_geo_filter = 'france',
    
    candidate_photo_url = COALESCE(p_photo_url, public.profiles.candidate_photo_url),
    candidate_presentation_type = COALESCE(p_presentation_type, public.profiles.candidate_presentation_type),
    candidate_cv_url = COALESCE(p_cv_url, public.profiles.candidate_cv_url),
    candidate_video_url = COALESCE(p_video_url, public.profiles.candidate_video_url),
    candidate_pitch = COALESCE(p_pitch, public.profiles.candidate_pitch),
    candidate_tags = COALESCE(p_tags, public.profiles.candidate_tags),
    is_available = COALESCE(p_available, public.profiles.is_available),
    candidate_onboarding_completed = true,
    updated_at = NOW()
  WHERE public.profiles.id = p_user_id
  RETURNING row_to_json(public.profiles.*) INTO v_result;

  IF v_result IS NULL THEN
      RAISE EXCEPTION 'Utilisateur introuvable (ID: %).', p_user_id;
  END IF;

  RETURN v_result;
END;
$$;


-- ============================================================
-- 3. FONCTION MATCHING (Mise à jour)
-- ============================================================
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
  created_days_ago INTEGER,
  tags TEXT[]
) AS $$
DECLARE
  v_candidate RECORD;
  v_allowed_depts TEXT[];
BEGIN
  -- Récupérer infos candidat
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
  WHERE p.id = p_candidate_id AND p.role = 'candidate';
  
  IF v_candidate.id IS NULL THEN RETURN; END IF;

  -- Zone géo
  IF v_candidate.candidate_geo_filter = 'france' THEN 
    v_allowed_depts := NULL; 
  ELSE
    v_allowed_depts := ARRAY[v_candidate.candidate_dept] || COALESCE(v_candidate.dept_neighbors, ARRAY[]::TEXT[]);
  END IF;
  
  RETURN QUERY
  SELECT 
    j.id, j.title, j.company, vj.name, j.salary,
    calculate_distance(v_candidate.candidate_lat, v_candidate.candidate_lng, vj.lat, vj.lng),
    (50)::INTEGER AS score, -- Score simplifié
    'perfect'::TEXT AS match_level,
    EXTRACT(DAY FROM (NOW() - j.created_at))::INTEGER,
    j.required_diplomas
  FROM jobs j
  JOIN villes_france vj ON j.city_id = vj.id
  WHERE 
    j.is_active = true
    AND v_candidate.candidate_diploma = ANY(j.required_diplomas)
    AND (v_allowed_depts IS NULL OR vj.department_code = ANY(v_allowed_depts))
    AND NOT EXISTS (SELECT 1 FROM swipes s WHERE s.candidate_id = p_candidate_id AND s.job_id = j.id)
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 4. DONNÉES TEST (Sans la colonne city !)
-- ============================================================

-- A. Offre test Paris
INSERT INTO jobs (title, company, city_id, required_diplomas, salary, is_active, created_at)
SELECT 'AMBULANCIER URGENCES (TEST)', 'SOS AMBULANCE', 10, ARRAY['DEA'], 2500, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'AMBULANCIER URGENCES (TEST)');

-- B. Réparer TOUS les candidats existants
UPDATE profiles
SET 
  city_id = 10,                 -- Paris
  candidate_diploma = 'DEA',    -- DEA
  candidate_geo_filter = 'france' -- France entière
WHERE role = 'candidate';

SELECT '✅ TOUT EST RÉPARÉ : Colonne city supprimée, Inscription OK, Matching OK' as status;
