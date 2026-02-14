-- 🕵️ SCRIPT DIAGNOSTIC MATCHING (Pourquoi mon offre n'apparait pas ?)

-- A. Remplacer ici par l'ID du candidat (toi) et l'ID de l'offre (celle que tu viens de créer)
DO $$
DECLARE
    -- METS TON ID CANDIDAT ICI 
    v_candidate_id UUID := 'TON_UUID_CANDIDAT'; 
    -- METS L'ID DE L'OFFRE ICI
    v_job_id UUID := 'L_UUID_DE_L_OFFRE';

    -- Variables pour le check
    v_cand RECORD;
    v_job RECORD;
    v_dist DECIMAL;
BEGIN
    -- 1. Récupérer infos
    SELECT * INTO v_cand FROM profiles WHERE id = v_candidate_id;
    SELECT * INTO v_job FROM jobs WHERE id = v_job_id;

    RAISE NOTICE '--- START DIAGNOSTIC ---';
    
    -- 2. Check existance
    IF v_cand IS NULL THEN RAISE NOTICE '❌ Candidat introuvable'; RETURN; END IF;
    IF v_job IS NULL THEN RAISE NOTICE '❌ Offre introuvable'; RETURN; END IF;

    -- 3. Check Diplôme
    IF NOT (v_cand.candidate_diploma = ANY(v_job.required_diplomas)) THEN
        RAISE NOTICE '❌ DIPLÔME DIFFÉRENT ! Candidat: %, Offre demande: %', v_cand.candidate_diploma, v_job.required_diplomas;
    ELSE
        RAISE NOTICE '✅ Diplôme OK';
    END IF;

    -- 4. Check Ville / Distance
    -- (On suppose que tu as les lat/lng dans villes_france)
    RAISE NOTICE '📍 Candidat CityID: %, Offre CityID: %', v_cand.city_id, v_job.city_id;
    
    -- 5. Check Déjà Swipé
    IF EXISTS (SELECT 1 FROM swipes WHERE candidate_id = v_candidate_id AND job_id = v_job_id) THEN
        RAISE NOTICE '❌ DÉJÀ SWIPÉ ! (Tu as déjà vu cette offre)';
    ELSE
        RAISE NOTICE '✅ Non swipé';
    END IF;

    RAISE NOTICE '--- END DIAGNOSTIC ---';
END $$;
