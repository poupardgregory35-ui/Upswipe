-- Script pour créer les tables manquantes ou incomplètes pour le Swipe Recruteur

-- 1. Table SWIPES
-- Elle stocke les actions (like/dislike) des recruteurs ET des candidats
CREATE TABLE IF NOT EXISTS public.swipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Qui swipe ?
    recruiter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Sur quoi ? (Pour un recruteur c'est un candidat, pour un candidat c'est un job)
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    
    -- Action
    direction TEXT NOT NULL CHECK (direction IN ('left', 'right')),
    
    -- Contrainte d'unicité (un seul swipe par couple job/candidat/auteur)
    -- On autorise plusieurs swipes si c'est recruteur vs candidat
    UNIQUE(job_id, candidate_id, recruiter_id)
);

-- RLS Swipes (Permissif pour MVP)
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public swipes" ON public.swipes;
CREATE POLICY "Public swipes" ON public.swipes FOR ALL USING (true) WITH CHECK (true);


-- 2. Table MATCHES
-- Elle stocke les matchs confirmés (Cœur réciproque ou Auto-match)
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    recruiter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    status TEXT DEFAULT 'pending', -- pending, accepted, rejected
    score INTEGER DEFAULT 0,
    
    UNIQUE(job_id, candidate_id) -- Un seul match actif par couple
);

-- RLS Matches (Permissif pour MVP)
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public matches" ON public.matches;
CREATE POLICY "Public matches" ON public.matches FOR ALL USING (true) WITH CHECK (true);

-- Recharge le cache
NOTIFY pgrst, 'reload config';
