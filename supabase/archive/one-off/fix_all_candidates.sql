-- 🚑 SCRIPT "TIR GROUPÉ" (Auto-fix pour le test)
-- Met à jour TOUS les candidats incomplets d'un coup.
-- Plus besoin de chercher ton UUID !

UPDATE profiles
SET 
  city_id = 10,                 -- Force PARIS par défaut pour le test
  candidate_diploma = 'DEA',    -- Force DEA
  candidate_geo_filter = 'france', -- Voir tout
  is_available = true
WHERE 
  role = 'candidate' 
  AND (city_id IS NULL OR candidate_diploma IS NULL);

SELECT '✅ TOUS LES CANDIDATS SONT RÉPARÉS (PRÊTS À MATCHER)' as status;
