-- 🚨 FIX URGENT : Remettre RLS mais CORRECTEMENT sur jobs

-- 1. On réactive RLS sur la table jobs (sinon faille sécurité)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- 2. On supprime les anciennes policies foireuses
DROP POLICY IF EXISTS "Public jobs are viewable by everyone" ON jobs;
DROP POLICY IF EXISTS "Users can insert their own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can update own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can delete own jobs" ON jobs;
DROP POLICY IF EXISTS "Recruiters can insert jobs" ON jobs; -- Au cas où
DROP POLICY IF EXISTS "Recruiters can update own jobs" ON jobs;
DROP POLICY IF EXISTS "Recruiters can delete own jobs" ON jobs;

-- 3. Policy LECTURE (Tout le monde peut voir les offres actives)
CREATE POLICY "Public jobs are viewable by everyone" ON jobs
    FOR SELECT USING (true);

-- 4. Policy INSERTION (Seulement les recruteurs authentifiés)
-- LE PIÈGE ÉTAIT LÀ : On vérifie juste que le recruiter_id = userid
CREATE POLICY "Recruiters can insert jobs" ON jobs
    FOR INSERT WITH CHECK (auth.uid() = recruiter_id);

-- 5. Policy MODIFICATION (Seulement le propriétaire)
CREATE POLICY "Recruiters can update own jobs" ON jobs
    FOR UPDATE USING (auth.uid() = recruiter_id);

-- 6. Policy SUPPRESSION (Seulement le propriétaire)
CREATE POLICY "Recruiters can delete own jobs" ON jobs
    FOR DELETE USING (auth.uid() = recruiter_id);

-- Verification
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'jobs';
