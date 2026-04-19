# ⚠️ DANGER — Ne pas exécuter en production

Les scripts dans ce dossier **désactivent la Row-Level Security**
sur des tables sensibles.

- `disable_jobs_rls.sql` : désactive la RLS sur `jobs`
- `disable_profiles_rls_temp.sql` : désactive la RLS sur `profiles`

Conservés uniquement pour debug en local.
**Ne jamais exécuter contre la base de production.**

Pour vérifier que la RLS est active :

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'jobs', 'applications', 'swipes');
```
