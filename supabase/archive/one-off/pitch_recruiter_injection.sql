-- ⚠️ SCRIPT CRITIQUE PITCH (CÔTÉ RECRUTEUR) ⚠️
-- Exécute ce script pour créer un profil Recruteur valide lié à un compte Google.

-- 1. Connecte-toi avec un AUTRE compte Google (ou le même, mais tu devras changer de rôle)
-- 2. Récupère son UID dans Supabase > Auth
-- 3. Remplace 'COLLE_UID_RECRUTEUR_ICI'
-- 4. Run !

INSERT INTO profiles (
  id,
  email,
  role,
  full_name,
  recruiter_company_name,   -- ⚠️ La clé pour être reconnu comme recruteur
  recruiter_company_city,
  created_at
)
VALUES (
  '5e84dbf1-7d0d-4e16-8119-30a2e6f52164',
  'recruteur.demo@upswipe.fr',
  'recruiter',
  'Grégory Poupard',
  'ASA Assistance',
  'Lyon',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  recruiter_company_name = EXCLUDED.recruiter_company_name,
  recruiter_company_city = EXCLUDED.recruiter_company_city,
  role = 'recruiter';
