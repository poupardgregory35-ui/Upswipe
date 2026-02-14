-- 🚨 MISE À JOUR MATCHING CANDIDAT
-- Ce script recree la fonction de matching pour être sûr qu'elle utilise les nouvelles tables.

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
  -- 1. Récupérer infos candidat + sa position via sa ville
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
  
  -- Si candidat pas trouvé ou pas de ville, pas de matching possible
  IF v_candidate.id IS NULL THEN
    RETURN;
  END IF;

  -- 2. Définir zone géo (Filtrage)
  CASE v_candidate.candidate_geo_filter
    WHEN 'department' THEN
      v_allowed_depts := ARRAY[v_candidate.candidate_dept];
    WHEN 'region' THEN
      v_allowed_depts := ARRAY[v_candidate.candidate_dept] || COALESCE(v_candidate.dept_neighbors, ARRAY[]::TEXT[]);
    WHEN 'france' THEN
      v_allowed_depts := NULL;
    ELSE
      -- Par défaut : région
      v_allowed_depts := ARRAY[v_candidate.candidate_dept] || COALESCE(v_candidate.dept_neighbors, ARRAY[]::TEXT[]);
  END CASE;
  
  -- 3. Retourner les Jobs scorés
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
      -- Distance
      CASE 
        WHEN calculate_distance(v_candidate.candidate_lat, v_candidate.candidate_lng, vj.lat, vj.lng) < 5 THEN 25
        WHEN calculate_distance(v_candidate.candidate_lat, v_candidate.candidate_lng, vj.lat, vj.lng) < 15 THEN 15
        WHEN calculate_distance(v_candidate.candidate_lat, v_candidate.candidate_lng, vj.lat, vj.lng) < 30 THEN 10
        ELSE 5
      END +
      -- Récence
      CASE 
        WHEN EXTRACT(EPOCH FROM (NOW() - j.created_at)) < 604800 THEN 20 -- 1 semaine
        WHEN EXTRACT(EPOCH FROM (NOW() - j.created_at)) < 2592000 THEN 10 -- 1 mois
        ELSE 0
      END
      -- Bonus/Malus type entreprise vs tags candidat (optionnel)
    )::INTEGER AS score,
    
    -- Niveau de Match Textuel
    CASE
      WHEN (50 + 
        CASE 
          WHEN calculate_distance(v_candidate.candidate_lat, v_candidate.candidate_lng, vj.lat, vj.lng) < 5 THEN 25
          ELSE 5
        END
      ) >= 70 THEN 'perfect'
      ELSE 'good'
    END AS match_level,
    
    EXTRACT(DAY FROM (NOW() - j.created_at))::INTEGER AS created_days_ago,
    
    -- On retourne les diplômes requis comme tags pour l'affichage
    j.required_diplomas AS tags

  FROM jobs j
  JOIN villes_france vj ON j.city_id = vj.id
  WHERE 
    j.is_active = true
    -- 🚨 FILTRE CRITIQUE : LE DIPLÔME DU CANDIDAT DOIT ÊTRE DANS LES REQUIS DU JOB
    AND v_candidate.candidate_diploma = ANY(j.required_diplomas)
    -- Filtre Géo
    AND (
      v_allowed_depts IS NULL 
      OR vj.department_code = ANY(v_allowed_depts)
    )
    -- Ne pas remontrer ce qu'on a déjà swipé
    AND NOT EXISTS (
      SELECT 1 FROM swipes s 
      WHERE s.candidate_id = p_candidate_id 
      AND s.job_id = j.id
    )
  ORDER BY score DESC, j.created_at DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

SELECT '✅ FONCTION MATCHING MISE A JOUR' as status;
