-- 🚑 FIX VISIBILITÉ CANDIDATURES

-- 1. On s'assure que la table existe et a RLS activé
CREATE TABLE IF NOT EXISTS applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    candidate_id UUID REFERENCES profiles(id) NOT NULL,
    job_id UUID REFERENCES jobs(id) NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, accepted, rejected
    source TEXT DEFAULT 'swipe',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- 2. D'abord, on nettoie les anciennes policies pour éviter les conflits
DROP POLICY IF EXISTS "Candidats voient leurs candidatures" ON applications;
DROP POLICY IF EXISTS "Recruteurs voient candidatures de leurs offres" ON applications;
DROP POLICY IF EXISTS "Users can insert applications" ON applications;
DROP POLICY IF EXISTS "Recruiters view applications for their jobs" ON applications;

-- 3. Policy pour que le CANDIDAT puisse insérer (quand il swipe)
CREATE POLICY "Users can insert applications" ON applications
    FOR INSERT WITH CHECK (auth.uid() = candidate_id);

-- 4. Policy pour que le CANDIDAT voit ses propres candidatures
CREATE POLICY "Candidats voient leurs candidatures" ON applications
    FOR SELECT USING (auth.uid() = candidate_id);

-- 5. Policy CRITIQUE : Le RECRUTEUR doit voir les applications liées à SES offres
-- On utilise une sous-requête pour vérifier que le job appartient au recruteur connecté
CREATE POLICY "Recruteurs voient candidatures de leurs offres" ON applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM jobs
            WHERE jobs.id = applications.job_id
            AND jobs.recruiter_id = auth.uid()
        )
    );

-- 6. Petit bonus : Vérifier s'il y a des applications orphelines (sans permission)
-- Cette requête ne changera rien à la base mais confirmera l'application des droits
SELECT count(*) as total_apps FROM applications;

NOTIFY pgrst, 'reload config';
