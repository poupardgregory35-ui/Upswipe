-- 🚨 SCRIPT D'URGENCE : RESTAURATION COMPLÈTE
-- Ce script recrée les tables perdues (profiles, jobs, applications)
-- et remet les bonnes colonnes et permissions.

BEGIN;

-- 1. TABLE PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    
    -- Champs communs
    email TEXT,
    role TEXT DEFAULT 'candidate', -- 'candidate' ou 'recruiter'
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    
    -- Champs Candidat
    candidate_diploma TEXT DEFAULT 'DEA',
    candidate_city TEXT,
    city_id INTEGER, -- Sera lié plus bas si la table villes_france existe
    candidate_geo_filter TEXT DEFAULT 'region',
    candidate_tags TEXT[],
    candidate_phone TEXT,
    candidate_photo_url TEXT,
    candidate_cv_url TEXT,
    candidate_video_url TEXT,
    candidate_pitch TEXT,
    candidate_presentation_type TEXT,
    is_available BOOLEAN DEFAULT true,
    candidate_onboarding_completed BOOLEAN DEFAULT false,

    -- Champs Recruteur
    recruiter_company_name TEXT,
    recruiter_company_type TEXT DEFAULT 'pme',
    
    -- Legacy (au cas où)
    first_name TEXT,
    company_name TEXT,
    company_city TEXT
);

-- 2. LIEN VILLES (Si villes_france existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'villes_france') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.key_column_usage WHERE table_name = 'profiles' AND column_name = 'city_id') THEN
            ALTER TABLE public.profiles 
            ADD CONSTRAINT fk_profiles_city 
            FOREIGN KEY (city_id) REFERENCES public.villes_france(id);
        END IF;
    END IF;
END $$;

-- 3. TABLE JOBS
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    recruiter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    description TEXT,
    company TEXT,
    city_id INTEGER REFERENCES public.villes_france(id),
    salary INTEGER,
    type TEXT DEFAULT 'CDI',
    required_diplomas TEXT[] DEFAULT ARRAY['DEA'],
    company_type TEXT DEFAULT 'pme',
    is_active BOOLEAN DEFAULT true,
    views INTEGER DEFAULT 0
);

-- 4. TABLE APPLICATIONS
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    status TEXT DEFAULT 'pending', -- pending, accepted, rejected
    recruiter_response TEXT, -- interested, rejected, null
    source TEXT DEFAULT 'manual',
    
    viewed_by_recruiter BOOLEAN DEFAULT false
);

-- 5. TRIGGER AUTH (Pour créer le profil quand un user s'inscrit)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'candidate')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- S'assurer que le trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. PERMISSIONS RLS (Row Level Security)

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Public profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- JOBS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public jobs view" ON public.jobs;
DROP POLICY IF EXISTS "Recruiters manage own jobs" ON public.jobs;

CREATE POLICY "Public jobs view" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Recruiters manage own jobs" ON public.jobs FOR ALL USING (auth.uid() = recruiter_id);

-- APPLICATIONS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Candidates view own apps" ON public.applications;
DROP POLICY IF EXISTS "Recruiters view job apps" ON public.applications;
DROP POLICY IF EXISTS "Candidates insert apps" ON public.applications;

-- Le candidat voit ses candidatures
CREATE POLICY "Candidates view own apps" ON public.applications
    FOR SELECT USING (auth.uid() = candidate_id);

-- Le recruteur voit les candidatures de ses jobs
CREATE POLICY "Recruiters view job apps" ON public.applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.jobs
            WHERE jobs.id = applications.job_id
            AND jobs.recruiter_id = auth.uid()
        )
    );
    
-- Le candidat peut postuler
CREATE POLICY "Candidates insert apps" ON public.applications
    FOR INSERT WITH CHECK (auth.uid() = candidate_id);

-- Le recruteur peut mettre à jour (répondre)
CREATE POLICY "Recruiters update apps" ON public.applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.jobs
            WHERE jobs.id = applications.job_id
            AND jobs.recruiter_id = auth.uid()
        )
    );

COMMIT;

SELECT '✅ TABLES RESTAURÉES AVEC SUCCÈS !' as status;
