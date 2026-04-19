# Ordre de reconstruction Supabase

Ce document décrit l'ordre d'exécution des fichiers SQL pour reconstruire
la base UPSWIPE à partir de zéro.

## Fichiers actifs (à la racine de `supabase/`)

Exécuter **dans cet ordre** sur une base vide :

| # | Fichier | Rôle |
|---|---------|------|
| 1 | `production_schema.sql` | Tables principales : profiles, jobs, applications, swipes |
| 2 | `triggers.sql` | Triggers auth → profiles (création auto) |
| 3 | `storage.sql` | Buckets Supabase Storage |
| 4 | `storage_avatars.sql` | Bucket avatars + policies |
| 5 | `fix_applications_rls.sql` | RLS sur la table applications |
| 6 | `secure_rls.sql` | RLS sur profiles + jobs (lecture/écriture) |
| 7 | `fix_jobs_rls_final.sql` | Version finale des policies jobs |
| 8 | `fix_auth_trigger.sql` | Correction trigger de création profil |
| 9 | `fix_onboarding_rpc.sql` | RPC d'onboarding candidat |
| 10 | `rpc_candidate_profile_get_v2.sql` | RPC lecture profil candidat |
| 11 | `rpc_candidate_profile_save_v2.sql` | RPC écriture profil candidat |
| 12 | `upgrade_matching_v4.sql` | Fonction de matching candidats/offres |
| 13 | `import_villes.sql` | Référentiel des villes (INSEE) |
| 14 | `seed_production.sql` | Données de seed production |

## Dossier `archive/`

Contient **43 fichiers** obsolètes ou dangereux, conservés pour historique :

- **`DANGER/`** (2 fichiers) : scripts qui **désactivent la RLS**.
  Ne **JAMAIS** exécuter en production.
  - `disable_jobs_rls.sql`
  - `disable_profiles_rls_temp.sql`
- **`debug/`** (7 fichiers) : scripts de diagnostic/debug.
- **`superseded/`** (20 fichiers) : versions antérieures remplacées.
- **`one-off/`** (9 fichiers) : correctifs ponctuels déjà appliqués
  (pitch injections, resets, backfills).

## Dossier `migrations/`

Contient les migrations suivies par la CLI Supabase :

- `001_phase1_reset.sql`

## Vérification RLS en production

À exécuter dans le SQL editor Supabase pour confirmer que la RLS est active :

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'jobs', 'applications', 'swipes');
```

Toutes les lignes doivent avoir `rowsecurity = true`.
