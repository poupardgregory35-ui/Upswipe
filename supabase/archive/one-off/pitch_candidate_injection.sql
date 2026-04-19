-- ⚠️ SCRIPT CRITIQUE POUR LE PITCH ⚠️
-- Ce script force la création d'un profil COMPLET pour ton compte Google.
-- Cela évite d'être redirigé vers la page "/setup-profil" pendant la démo.

-- 1. Va dans Supabase > Authentication > Users
-- 2. Copie l'User UID de "dir.capso@gmail.com"
-- 3. Remplace 'COLLE_TON_UID_ICI' ci-dessous (Garde les guillemets !)
-- 4. Exécute ce contenu dans Supabase > SQL Editor

INSERT INTO profiles (
  id,
  email,
  role,
  full_name,        -- ⚠️ CORRECTION: Gemini suggérait first_name, mais la BDD attend full_name
  phone,            -- ⚠️ OBLIGATOIRE pour éviter la redirection vers le setup
  city,
  diploma,
  experience_years,
  bio,
  is_available,
  created_at
)
VALUES (
  'COLLE_TON_UID_ICI',      -- 👈 TON UID SUPABASE ICI
  'dir.capso@gmail.com',    -- Ton email Google
  'candidate',
  'Grégory Poupard',
  '06 12 34 56 78',         -- Numéro requis pour le Dashboard
  'Paris',
  'DEA',                    -- Diplôme affiché (Blue Badge)
  10,
  'Compte Admin Pitch',
  true,                     -- Disponible pour le switch
  NOW()
)
ON CONFLICT (id) DO UPDATE SET 
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  diploma = EXCLUDED.diploma,
  is_available = EXCLUDED.is_available,
  role = 'candidate',
  recruiter_company_name = NULL, -- ⚠️ Important pour revenir au mode Candidat
  recruiter_company_city = NULL;       -- Force le rôle candidat
