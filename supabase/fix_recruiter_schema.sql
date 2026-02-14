-- Ce script s'assure que TOUTES les colonnes nécessaires au profil recruteur existent.
-- Il utilise "IF NOT EXISTS" pour ne pas casser si certaines sont déjà là.

-- 1. Ajout des colonnes potentiellement manquantes
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS recruiter_company_email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS recruiter_company_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS recruiter_company_city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS recruiter_company_phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS recruiter_company_type TEXT;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS recruiter_needs TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS recruiter_urgency TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS recruiter_onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS recruiter_validated BOOLEAN DEFAULT true;

-- 2. Force le rechargement du cache API
NOTIFY pgrst, 'reload config';
