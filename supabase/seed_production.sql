-- =================================================================
-- UPSWIPE SEED - ADAPTÉ À TON SCHÉMA RÉEL
-- =================================================================

-- 1️⃣ AJOUT COLONNES MANQUANTES
-- =================================================================

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS diploma text,
ADD COLUMN IF NOT EXISTS experience_years integer,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT true;

ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS diploma text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';


-- 2️⃣ NETTOYAGE
-- =================================================================

DELETE FROM jobs;
DELETE FROM profiles WHERE role = 'candidate';


-- 3️⃣ SEED CANDIDATS (50)
-- =================================================================

INSERT INTO profiles (
  id,
  email,
  role,
  full_name,
  phone,
  city,
  diploma,
  experience_years,
  bio,
  is_available,
  created_at
)
SELECT 
  gen_random_uuid(),
  'demo.candidat' || i || '@upswipe.fr',
  'candidate',
  (ARRAY[
    'Kevin Martin', 'Sarah Lefèvre', 'Thomas Dubois', 'Julie Renault',
    'Maxime Blanchard', 'Céline Perrin', 'Alexandre Vidal', 'Marion Fournier',
    'Lucas Tessier', 'Emma Dupont', 'Nathalie Roux', 'Paul Garnier',
    'Sophie Lemoine', 'Antoine Moreau', 'Laura Bertrand'
  ])[ (i % 15) + 1 ],
  '06' || lpad( (10000000 + floor(random() * 90000000))::text, 8, '0'),
  (ARRAY['Rennes', 'Brest', 'Lorient', 'Vannes', 'Saint-Malo', 'Nantes', 'Paris'])[ (i % 7) + 1 ],
  (ARRAY['DEA', 'Auxiliaire', 'IDE', 'Régulateur'])[ (i % 4) + 1 ],
  floor(random() * 12) + 1,
  'Professionnel motivé, ponctuel, expérience transport sanitaire.',
  (random() > 0.18),
  NOW() - (random() * interval '90 days')
FROM generate_series(1, 50) i;


-- 4️⃣ SEED OFFRES (20)
-- =================================================================

INSERT INTO jobs (
  id,
  title,
  company,
  city,
  salary,
  type,
  required_license,
  diploma,
  status,
  created_at
)
VALUES
  (gen_random_uuid(), 'Ambulancier DEA Nuit URGENT', 'Jussieu Secours', 'Rennes', 2450, 'CDD', 'D', 'DEA', 'active', NOW() - interval '3 hours'),
  (gen_random_uuid(), 'Auxiliaire Jour', 'Ambulances Martin', 'Rennes', 2100, 'CDI', 'B', 'Auxiliaire', 'active', NOW() - interval '1 day'),
  (gen_random_uuid(), 'DEA SMUR CHU', 'CHU Rennes', 'Rennes', 2850, 'CDI', 'D', 'DEA', 'active', NOW() - interval '2 days'),
  (gen_random_uuid(), 'VSL Week-end', 'TransVie', 'Rennes', 1950, 'CDD', 'B', 'Auxiliaire', 'active', NOW() - interval '4 days'),
  (gen_random_uuid(), 'Régulateur SAMU', 'SAMU 29', 'Brest', 2250, 'CDD', 'B', 'Régulateur', 'active', NOW() - interval '1 day'),
  (gen_random_uuid(), 'DEA Polyvalent', 'Ambulances Armor', 'Brest', 2450, 'CDI', 'D', 'DEA', 'active', NOW() - interval '3 days'),
  (gen_random_uuid(), 'Auxiliaire été', 'Taxi Santé Ouest', 'Lorient', 1980, 'Interim', 'B', 'Auxiliaire', 'active', NOW() - interval '5 days'),
  (gen_random_uuid(), 'DEA Vannes', 'Grand Ouest Secours', 'Vannes', 2520, 'CDI', 'D', 'DEA', 'active', NOW() - interval '6 days'),
  (gen_random_uuid(), 'VSL CDI', 'Ambulances Dupond', 'Lorient', 1920, 'CDI', 'B', 'Auxiliaire', 'active', NOW() - interval '2 days'),
  (gen_random_uuid(), 'DEA Bariatrique', 'Ambulances Plus', 'Vannes', 2680, 'CDI', 'D', 'DEA', 'active', NOW() - interval '1 day'),
  (gen_random_uuid(), 'Régulateur Centre 15', 'Centre 15 35', 'Saint-Malo', 2300, 'CDD', 'B', 'Régulateur', 'active', NOW() - interval '4 days'),
  (gen_random_uuid(), 'Chef équipe DEA', 'Ambulances Nantes', 'Nantes', 2950, 'CDI', 'D', 'DEA', 'active', NOW() - interval '5 days'),
  (gen_random_uuid(), 'Auxiliaire Nuit', 'SOS Médecins 44', 'Nantes', 2080, 'Interim', 'B', 'Auxiliaire', 'active', NOW() - interval '2 days'),
  (gen_random_uuid(), 'DEA Événementiel', 'Secours Événements', 'Nantes', 2450, 'CDD', 'D', 'DEA', 'active', NOW() - interval '7 days'),
  (gen_random_uuid(), 'DEA Paris Centre', 'Urgences 75', 'Paris', 2780, 'CDI', 'D', 'DEA', 'active', NOW() - interval '1 day'),
  (gen_random_uuid(), 'Régulateur SAMU 93', 'SAMU Bobigny', 'Paris', 2420, 'CDD', 'B', 'Régulateur', 'active', NOW() - interval '3 days'),
  (gen_random_uuid(), 'Auxiliaire VSL IDF', 'TransVie IDF', 'Paris', 2180, 'Interim', 'B', 'Auxiliaire', 'active', NOW() - interval '4 days'),
  (gen_random_uuid(), 'DEA Pédiatrique', 'Hôpital Necker', 'Paris', 2920, 'CDI', 'D', 'DEA', 'active', NOW() - interval '6 days'),
  (gen_random_uuid(), 'VSL Aéroport', 'Ambulances CDG', 'Paris', 2120, 'CDD', 'B', 'Auxiliaire', 'active', NOW() - interval '2 days'),
  (gen_random_uuid(), 'DEA Transferts', 'Ambulances IDF', 'Paris', 2650, 'CDI', 'D', 'DEA', 'active', NOW() - interval '9 days');


-- 5️⃣ VÉRIFICATION
-- =================================================================

SELECT
  'Candidats' AS type,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE is_available = true) AS disponibles
FROM profiles
WHERE role = 'candidate'

UNION ALL

SELECT
  'Offres',
  COUNT(*),
  COUNT(*) FILTER (WHERE status = 'active')
FROM jobs;
