-- 🚑 SCRIPT D'URGENCE : RÉPARATION DE LA BASE DE DONNÉES
-- Exécute ceci AVANT les scripts d'injection. Ça ajoute les colonnes manquantes.

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS diploma text,              -- manquait pour le candidat
ADD COLUMN IF NOT EXISTS experience_years integer,
ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS recruiter_company_name text, -- manquera pour le recruteur
ADD COLUMN IF NOT EXISTS recruiter_company_city text;

-- Réparations aussi sur la table Job (au cas où)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS required_license text,
ADD COLUMN IF NOT EXISTS diploma text,
ADD COLUMN IF NOT EXISTS type text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Vérifie (optionnel)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';
