-- 🚨 SCRIPT DE DÉPANNAGE ET SÉCURISATION (SMART RLS)
-- Exécute ce script entier dans ton Supabase SQL Editor pour corriger les erreurs de sauvegarde.

-- 1. Activer RLS sur les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

-- 2. PROFILS : Chacun voit tout le monde (pour swiper), mais modifie uniquement son propre profil
DROP POLICY IF EXISTS "Public profiles view" ON public.profiles;
CREATE POLICY "Public profiles view" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. JOBS : Tout le monde voit, seul le recruteur modifie ses offres
DROP POLICY IF EXISTS "Jobs are public" ON public.jobs;
CREATE POLICY "Jobs are public" ON public.jobs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Recruiters manage own jobs" ON public.jobs;
CREATE POLICY "Recruiters manage own jobs" ON public.jobs
    FOR ALL USING (auth.uid() = recruiter_id)
    WITH CHECK (auth.uid() = recruiter_id);

-- 4. SWIPES : L'utilisateur gère ses propres swipes
DROP POLICY IF EXISTS "Users manage own swipes" ON public.swipes;
CREATE POLICY "Users manage own swipes" ON public.swipes
    FOR ALL USING (auth.uid() = recruiter_id OR auth.uid() = candidate_id)
    WITH CHECK (auth.uid() = recruiter_id OR auth.uid() = candidate_id);

-- 5. MATCHES : (Optionnel, au cas où)
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own matches" ON public.matches;
CREATE POLICY "Users manage own matches" ON public.matches
    FOR ALL USING (auth.uid() = recruiter_id OR auth.uid() = candidate_id)
    WITH CHECK (auth.uid() = recruiter_id OR auth.uid() = candidate_id);

-- Confirme que tout est bon
NOTIFY pgrst, 'reload config';
