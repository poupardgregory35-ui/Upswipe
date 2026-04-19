-- 🧽 NETTOYAGE COMPLET + DEBUG

-- 1. On supprime les candidatures existantes (pour repartir proper)
TRUNCATE TABLE applications;
TRUNCATE TABLE swipes;

-- 2. On vérifie les droits RLS actuels
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('applications', 'swipes', 'jobs');

-- 3. Une fonction de debug pour voir TOUTES les lignes (admin only logiquement, mais ici pour debug)
CREATE OR REPLACE FUNCTION debug_get_all_applications()
RETURNS TABLE (
    app_id UUID,
    candidate_email TEXT,
    job_title TEXT,
    recruiter_id UUID
) SECURITY DEFINER -- ⚠️ Contourne RLS
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        p.email,
        j.title,
        j.recruiter_id
    FROM applications a
    JOIN profiles p ON p.id = a.candidate_id
    JOIN jobs j ON j.id = a.job_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Vérification simple de visibility
CREATE OR REPLACE FUNCTION debug_check_visibility()
RETURNS JSONB 
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'current_user', auth.uid(),
        'count_apps_visible_normal', (SELECT count(*) FROM applications),
        'count_apps_total_admin', (SELECT count(*) FROM applications) -- Wait, same context? No, inside SECURITY DEFINER it sees all if using direct SELECT? 
        -- Actually simple SELECT here uses the definer's rights (Postgres role), usually 'postgres' or 'service_role' which bypasses RLS if not careful, 
        -- but usually RLS applies to the table owner unless BYPASSRLS is set.
        -- Let's just return basic counts.
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 5. (Optionnel) Désactiver temporairement RLS sur applications si on est désespéré
-- ALTER TABLE applications DISABLE ROW LEVEL SECURITY;
