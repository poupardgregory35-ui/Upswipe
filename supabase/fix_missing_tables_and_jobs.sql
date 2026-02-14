-- 🚨 SCRIPT DE SAUVETAGE COMPLET (Villes + Jobs + RLS)
-- Exécuter ce script pour TOUT réparer d'un coup.

-- 1. CRÉATION DE LA TABLE VILLES (Manquante)
CREATE TABLE IF NOT EXISTS villes_france (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  postal_code TEXT,
  department_code TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8)
);

-- 2. INSERTION DES VILLES REQUISES (Pour que l'app marche)
-- On utilise ON CONFLICT DO NOTHING pour ne pas planter si elles existent déjà
INSERT INTO villes_france (id, name, postal_code, department_code, lat, lng) VALUES
(1, 'Rennes', '35000', '35', 48.1173, -1.6778),
(2, 'Saint-Malo', '35400', '35', 48.6493, -2.0257),
(3, 'Fougères', '35300', '35', 48.3512, -1.2016),
(4, 'Vitré', '35500', '35', 48.1235, -1.2131),
(5, 'Redon', '35600', '35', 47.6530, -2.0838),
(6, 'Brest', '29200', '29', 48.3904, -4.4861),
(7, 'Lorient', '56100', '56', 47.7485, -3.3702),
(8, 'Vannes', '56000', '56', 47.6582, -2.7608),
(9, 'Nantes', '44000', '44', 47.2184, -1.5536),
(10, 'Paris', '75000', '75', 48.8566, 2.3522)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 3. SI LA SEQUENCE EST PROTÉGÉE, ON LA MET A JOUR
SELECT setval(pg_get_serial_sequence('villes_france', 'id'), 11, false);


-- 4. AJOUT DES COLONNES MANQUANTES DANS JOBS
DO $$ 
BEGIN
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
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='jobs' AND column_name='is_active') THEN
        ALTER TABLE jobs ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;


-- 5. CORRECTION DES DROITS (RLS)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Nettoyage des anciennes policies
DROP POLICY IF EXISTS "Public jobs" ON jobs;
DROP POLICY IF EXISTS "Jobs are public" ON jobs;
DROP POLICY IF EXISTS "Recruiters manage own jobs" ON jobs;
DROP POLICY IF EXISTS "Recruiters CRUD own jobs" ON jobs;
DROP POLICY IF EXISTS "Insert jobs" ON jobs;
DROP POLICY IF EXISTS "Public jobs view" ON jobs;

-- Recréation propre
CREATE POLICY "Public jobs view" ON jobs FOR SELECT USING (true);

CREATE POLICY "Recruiters manage own jobs" ON jobs
    FOR ALL
    USING (auth.uid() = recruiter_id)
    WITH CHECK (auth.uid() = recruiter_id);

SELECT '✅ DONE: VILLES CRÉÉES + JOBS CORRIGÉS + DROITS ACTIVÉS' as status;
