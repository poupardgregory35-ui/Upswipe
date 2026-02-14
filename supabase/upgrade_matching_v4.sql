-- 📊 MISE À JOUR MATCHING & OFFRE

-- 1. AJOUT COLONNE DESCRIPTION
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. FONCTION MATCHING V4 (INSENSIBLE CASSE + GÉO PRÉCISE)
CREATE OR REPLACE FUNCTION get_swipe_jobs(
  p_candidate_id UUID
)
RETURNS TABLE (
  job_id UUID,
  job_title TEXT,
  company_name TEXT,
  city_name TEXT,
  description TEXT,
  salary INTEGER,
  distance_km DECIMAL,
  score INTEGER,
  match_level TEXT,
  created_days_ago INTEGER
) AS $$
DECLARE
  v_candidate RECORD;
  v_allowed_depts TEXT[];
  v_candidate_diploma_upper TEXT;
BEGIN
  -- Récupérer candidat
  SELECT 
    p.*,
    UPPER(p.candidate_diploma) AS diploma_upper, -- ✅ Normalisation majuscules
    vc.lat AS candidate_lat,
    vc.lng AS candidate_lng,
    vc.department_code AS candidate_dept,
    d.neighbors AS dept_neighbors
  INTO v_candidate
  FROM profiles p
  LEFT JOIN villes_france vc ON p.city_id = vc.id
  LEFT JOIN departements_france d ON vc.department_code = d.code
  WHERE p.id = p_candidate_id 
    AND p.role = 'candidate';
  
  -- Si pas de candidat ou pas de ville, retourner vide
  IF v_candidate.id IS NULL OR v_candidate.candidate_lat IS NULL THEN 
    RETURN; 
  END IF;

  v_candidate_diploma_upper := v_candidate.diploma_upper;

  -- Départements autorisés selon filtre géo
  CASE COALESCE(v_candidate.candidate_geo_filter, 'region')
    WHEN 'france' THEN 
      v_allowed_depts := NULL; -- Toute la France
    WHEN 'department' THEN
      v_allowed_depts := ARRAY[v_candidate.candidate_dept]; -- Département uniquement
    ELSE -- 'region'
      v_allowed_depts := ARRAY[v_candidate.candidate_dept] || COALESCE(v_candidate.dept_neighbors, ARRAY[]::TEXT[]); -- Région + voisins
  END CASE;
  
  RETURN QUERY
  SELECT 
    j.id AS job_id,
    j.title AS job_title,
    j.company AS company_name,
    vj.name AS city_name,
    j.description,
    j.salary,
    calculate_distance(
      v_candidate.candidate_lat, 
      v_candidate.candidate_lng, 
      vj.lat, 
      vj.lng
    ) AS distance_km,
    (
      50 +
      -- Distance
      CASE 
        WHEN calculate_distance(v_candidate.candidate_lat, v_candidate.candidate_lng, vj.lat, vj.lng) < 5 THEN 25
        WHEN calculate_distance(v_candidate.candidate_lat, v_candidate.candidate_lng, vj.lat, vj.lng) < 15 THEN 15
        WHEN calculate_distance(v_candidate.candidate_lat, v_candidate.candidate_lng, vj.lat, vj.lng) < 30 THEN 10
        ELSE 5
      END +
      -- Ancienneté
      CASE 
        WHEN EXTRACT(EPOCH FROM (NOW() - j.created_at)) < 604800 THEN 20
        WHEN EXTRACT(EPOCH FROM (NOW() - j.created_at)) < 2592000 THEN 10
        ELSE 0
      END
    )::INTEGER AS score,
    CASE
      WHEN calculate_distance(v_candidate.candidate_lat, v_candidate.candidate_lng, vj.lat, vj.lng) < 15 THEN 'perfect'
      WHEN calculate_distance(v_candidate.candidate_lat, v_candidate.candidate_lng, vj.lat, vj.lng) < 30 THEN 'good'
      ELSE 'ok'
    END AS match_level,
    EXTRACT(DAY FROM (NOW() - j.created_at))::INTEGER AS created_days_ago
  FROM jobs j
  JOIN villes_france vj ON j.city_id = vj.id
  WHERE 
    j.is_active = true
    
    -- ✅ MATCHING DIPLÔME (insensible casse)
    AND EXISTS (
      SELECT 1 
      FROM unnest(j.required_diplomas) AS diploma
      WHERE UPPER(diploma) = v_candidate_diploma_upper
    )
    
    -- ✅ MATCHING GÉOGRAPHIQUE
    AND (
      v_allowed_depts IS NULL 
      OR vj.department_code = ANY(v_allowed_depts)
    )
    
    -- Exclure déjà swipés
    AND NOT EXISTS (
      SELECT 1 FROM swipes s 
      WHERE s.candidate_id = p_candidate_id 
      AND s.job_id = j.id
    )
    
  ORDER BY score DESC, j.created_at DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

SELECT '✅ UPGRADE TERMINÉ : Colonne description + Matching V4' as status;
