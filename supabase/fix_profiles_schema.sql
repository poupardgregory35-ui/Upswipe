-- 🚨 SCRIPT DE RÉPARATION (PROFILES)
-- Ajoute les colonnes manquantes au profil candidat/recruteur

DO $$ 
BEGIN
    -- 1. CLÉ ÉTRANGÈRE VILLE (Essentiel pour le matching)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='city_id') THEN
        ALTER TABLE profiles ADD COLUMN city_id INTEGER REFERENCES villes_france(id);
    END IF;

    -- 2. DIPLÔME CANDIDAT
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='candidate_diploma') THEN
        ALTER TABLE profiles ADD COLUMN candidate_diploma TEXT DEFAULT 'DEA';
    END IF;

    -- 3. FILTRES GÉO & TAGS
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='candidate_geo_filter') THEN
        ALTER TABLE profiles ADD COLUMN candidate_geo_filter TEXT DEFAULT 'region';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='candidate_tags') THEN
        ALTER TABLE profiles ADD COLUMN candidate_tags TEXT[];
    END IF;

    -- 4. INFOS COMPLÉMENTAIRES
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='candidate_city') THEN
        ALTER TABLE profiles ADD COLUMN candidate_city TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='candidate_phone') THEN
        ALTER TABLE profiles ADD COLUMN candidate_phone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone') THEN
        ALTER TABLE profiles ADD COLUMN phone TEXT;
    END IF;

    -- 5. RECRUTEUR (Au cas où)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='recruiter_company_name') THEN
        ALTER TABLE profiles ADD COLUMN recruiter_company_name TEXT;
    END IF;
END $$;

SELECT '✅ PROFILES RÉPARÉ' as status;
