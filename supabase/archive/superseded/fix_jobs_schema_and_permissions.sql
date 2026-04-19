-- 🚨 SCRIPT DE RÉPARATION CRITIQUE (JOBS & RLS)
-- Exécute ce script dans Supabase SQL Editor pour corriger l'impossible publication d'offres.

-- 1. AJOUT DES COLONNES MANQUANTES (Si elles n'existent pas)
DO $$ 
BEGIN
    -- Colonnes essentielles pour la création d'offre
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='jobs' AND column_name='company') THEN
        ALTER TABLE jobs ADD COLUMN company TEXT DEFAULT 'Entreprise';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='jobs' AND column_name='city_id') THEN
        ALTER TABLE jobs ADD COLUMN city_id INTEGER REFERENCES villes_france(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='jobs' AND column_name='salary') THEN
        ALTER TABLE jobs ADD COLUMN salary INTEGER CHECK (salary >= 1500 AND salary <= 5000);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='jobs' AND column_name='type') THEN
        ALTER TABLE jobs ADD COLUMN type TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='jobs' AND column_name='company_type') THEN
        ALTER TABLE jobs ADD COLUMN company_type TEXT DEFAULT 'pme';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='jobs' AND column_name='required_diplomas') THEN
        ALTER TABLE jobs ADD COLUMN required_diplomas TEXT[] DEFAULT ARRAY['DEA'];
    END IF;
    
    -- Colonne is_active
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='jobs' AND column_name='is_active') THEN
        ALTER TABLE jobs ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 2. CORRECTION DES DROITS (RLS/POLICIES)
-- On reset les policies pour être sûr
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public jobs" ON jobs;
DROP POLICY IF EXISTS "Jobs are public" ON jobs;
DROP POLICY IF EXISTS "Recruiters manage own jobs" ON jobs;
DROP POLICY IF EXISTS "Recruiters CRUD own jobs" ON jobs;
DROP POLICY IF EXISTS "Insert jobs" ON jobs; -- Ancienne policy

-- Policy 1: Tout le monde peut voir les offres actives
CREATE POLICY "Public jobs view" ON jobs
    FOR SELECT
    USING (true);

-- Policy 2: Les recruteurs peuvent TOUT faire sur leurs propres offres (INSERT, UPDATE, DELETE)
CREATE POLICY "Recruiters manage own jobs" ON jobs
    FOR ALL
    USING (auth.uid() = recruiter_id)
    WITH CHECK (auth.uid() = recruiter_id);

-- 3. CONFIRMATION
SELECT '✅ SCRIPT TERMINÉ : Colonnes et Permissions corrigées.' as status;
