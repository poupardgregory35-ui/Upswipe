-- 🕵️ SCRIPT DE DIAGNOSTIC MATCHING
-- Remplacer l'ID du candidat ci-dessous pour voir pourquoi il ne voit pas les offres.

DO $$
DECLARE
    -- 👇 REMPLACE L'ID CI-DESSOUS PAR L'ID DU CANDIDAT (DANS LA TABLE PROFILES/AUTH)
    v_candidate_id UUID := '00000000-0000-0000-0000-000000000000'; -- EXEMPLE
    v_candidate RECORD;
    v_rec RECORD;
BEGIN
    SELECT * INTO v_candidate FROM profiles WHERE id = v_candidate_id;
    
    RAISE NOTICE '--- DIAGNOSTIC POUR CANDIDAT % ---', v_candidate.email;
    RAISE NOTICE 'Role: %', v_candidate.role;
    RAISE NOTICE 'Ville ID: %', v_candidate.city_id;
    RAISE NOTICE 'Diplôme: %', v_candidate.candidate_diploma;
    RAISE NOTICE 'Filtre Géo: %', v_candidate.candidate_geo_filter;
    
    FOR v_rec IN SELECT * FROM jobs WHERE is_active = true LOOP
        RAISE NOTICE '---------------------------------------------------';
        RAISE NOTICE 'JOB: % (ID: %) - Entreprise: %', v_rec.title, v_rec.id, v_rec.company;
        RAISE NOTICE '  -> Requis: %', v_rec.required_diplomas;
        RAISE NOTICE '  -> Match Diplôme ? : %', (v_candidate.candidate_diploma = ANY(v_rec.required_diplomas));
        
        -- Check distance (approximatif pour debug)
        RAISE NOTICE '  -> Ville Job ID: %', v_rec.city_id;
       
        -- Check swipe
        IF EXISTS (SELECT 1 FROM swipes WHERE candidate_id = v_candidate_id AND job_id = v_rec.id) THEN
             RAISE NOTICE '  -> ❌ DÉJÀ SWIPÉ (Caché)';
        ELSE
             RAISE NOTICE '  -> ✅ NON SWIPÉ';
        END IF;
    END LOOP;
END $$;
