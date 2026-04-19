-- 🔓 DISABLE RLS ON JOBS

-- Cette commande désactive temporairement la sécurité RLS sur la table 'jobs'.
-- Si l'insertion fonctionne après ça, c'est confirmée à 100% que c'était une policy RLS trop stricte.

ALTER TABLE public.jobs DISABLE ROW LEVEL SECURITY;
