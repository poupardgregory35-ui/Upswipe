-- 🧹 SCRIPT MENAGE & TEST
-- 1. Supprime TOUTES les offres sauf la tienne (ID: ...8a4)
-- 2. Supprime l'historique de tes swipes (pour que tu revoies l'offre)
-- 3. Vérifie pourquoi ça matche (ou pas)

BEGIN;

-- A. MENAGE : On supprime toutes les offres sauf CELLE-LA
DELETE FROM jobs 
WHERE id != '4d980fc0-5881-42fe-a5f5-2472733ae8a4';

-- B. RESET : On efface tes swipes pour que l'offre réapparaisse
DELETE FROM swipes 
WHERE candidate_id = '67d022cc-96d2-4dd7-a530-ca44db740b35';

-- C. DIAGNOSTIC : Pourquoi ça matche pas ?
DO $$
DECLARE
    v_cand RECORD;
    v_job RECORD;
BEGIN
    SELECT * INTO v_cand FROM profiles WHERE id = '67d022cc-96d2-4dd7-a530-ca44db740b35';
    SELECT * INTO v_job FROM jobs WHERE id = '4d980fc0-5881-42fe-a5f5-2472733ae8a4';

    RAISE NOTICE '---------------------------------------------------';
    RAISE NOTICE '🕵️‍♂️ ANALYSE DU MATCH';
    RAISE NOTICE '---------------------------------------------------';

    -- 1. DIPLÔME
    IF v_cand.candidate_diploma = ANY(v_job.required_diplomas) THEN
        RAISE NOTICE '✅ DIPLÔME OK (% coté candidat)', v_cand.candidate_diploma;
    ELSE
        RAISE NOTICE '❌ DIPLÔME KO ! Candidat: %, Offre veut: %', v_cand.candidate_diploma, v_job.required_diplomas;
    END IF;

    -- 2. POSITION
    RAISE NOTICE '📍 VILLE : Candidat CityID=%, Offre CityID=%', v_cand.city_id, v_job.city_id;

    -- 3. FILTRE GEO
    RAISE NOTICE '🌍 FILTRE : Le candidat cherche sur : %', v_cand.candidate_geo_filter;

    IF v_cand.city_id IS NULL THEN
        RAISE NOTICE '⚠️ ALERTE : Le candidat n''a pas de ville (city_id est NULL) !';
        -- On fixe ça direct au cas où
        UPDATE profiles SET city_id=10, candidate_geo_filter='france' WHERE id='67d022cc-96d2-4dd7-a530-ca44db740b35';
        RAISE NOTICE '🛠️ REPARATION : Ville forcée à Paris (10) + Filtre France.';
    END IF;
    
    RAISE NOTICE '---------------------------------------------------';
END $$;

COMMIT;

SELECT '✅ Ménage Terminé (Reste 1 offre) + Reset Swipes effectué.' as status;
