-- =================================================================
-- UPSWIPE - IMPORT CODES POSTAUX
-- Exécuter en SECOND après production_schema.sql
-- =================================================================

-- OPTION A : Import Manuel (Villes Principales Seulement)
-- =================================================================
-- Pour démo/tests uniquement - 30 villes principales France
INSERT INTO villes_france (name, postal_code, department_code, is_major, lat, lng) VALUES
('Rennes', '35000', '35', true, 48.1173, -1.6778),
('Saint-Malo', '35400', '35', true, 48.6500, -2.0260),
('Fougères', '35300', '35', true, 48.3519, -1.1981),
('Vitré', '35500', '35', true, 48.1246, -1.2093),
('Redon', '35600', '35', true, 47.6519, -2.0841),
('Brest', '29200', '29', true, 48.3905, -4.4861),
('Quimper', '29000', '29', true, 47.9960, -4.0970),
('Lorient', '56100', '56', true, 47.7482, -3.3706),
('Vannes', '56000', '56', true, 47.6586, -2.7603),
('Saint-Brieuc', '22000', '22', true, 48.5145, -2.7650),
('Nantes', '44000', '44', true, 47.2184, -1.5536),
('Angers', '49000', '49', true, 47.4784, -0.5632),
('Le Mans', '72000', '72', true, 48.0077, 0.1984),
('Paris', '75001', '75', true, 48.8566, 2.3522),
('Marseille', '13001', '13', true, 43.2965, 5.3698),
('Lyon', '69001', '69', true, 45.7640, 4.8357),
('Toulouse', '31000', '31', true, 43.6047, 1.4442),
('Nice', '06000', '06', true, 43.7102, 7.2620),
('Strasbourg', '67000', '67', true, 48.5734, 7.7521),
('Bordeaux', '33000', '33', true, 44.8378, -0.5792),
('Lille', '59000', '59', true, 50.6292, 3.0573),
('Montpellier', '34000', '34', true, 43.6108, 3.8767),
('Reims', '51100', '51', true, 49.2583, 4.0317),
('Dijon', '21000', '21', true, 47.3220, 5.0415),
('Grenoble', '38000', '38', true, 45.1885, 5.7245),
('Toulon', '83000', '83', true, 43.1242, 5.9280),
('Clermont-Ferrand', '63000', '63', true, 45.7772, 3.0870),
('Caen', '14000', '14', true, 49.1829, -0.3707),
('Rouen', '76000', '76', true, 49.4432, 1.0993),
('Perpignan', '66000', '66', true, 42.6886, 2.8948)
ON CONFLICT (postal_code, name) DO NOTHING;


-- OPTION B : Import Complet (RECOMMANDÉ PRODUCTION)
-- =================================================================
-- Télécharger : https://datanova.laposte.fr/datasets/laposte-hexasmal
-- Fichier : laposte_hexasmal.csv (~36k lignes)

-- 1. Créer table temporaire
CREATE TEMP TABLE IF NOT EXISTS temp_codes_postaux (
  Code_commune_INSEE TEXT,
  Nom_commune TEXT,
  Code_postal TEXT,
  Libelle_acheminement TEXT,
  Ligne_5 TEXT,
  coordonnees_gps TEXT
);

-- 2. Importer CSV via Supabase
-- Méthode 1 : Supabase Storage
-- - Upload CSV dans Storage
-- - Copier public URL
-- - Remplacer 'YOUR_CSV_URL' ci-dessous

-- Méthode 2 : psql local
-- psql -h YOUR_HOST -U postgres -d postgres -c "\COPY temp_codes_postaux FROM 'laposte_hexasmal.csv' DELIMITER ';' CSV HEADER ENCODING 'UTF8';"

-- 3. Parser et insérer
INSERT INTO villes_france (name, postal_code, department_code, lat, lng, is_major)
SELECT DISTINCT ON (Code_postal, Libelle_acheminement)
  Libelle_acheminement,
  Code_postal,
  LEFT(Code_postal, 2),
  SPLIT_PART(coordonnees_gps, ',', 1)::DECIMAL,
  SPLIT_PART(coordonnees_gps, ',', 2)::DECIMAL,
  false
FROM temp_codes_postaux
WHERE coordonnees_gps IS NOT NULL
  AND coordonnees_gps != ''
  AND coordonnees_gps NOT LIKE '%-%'
  AND LENGTH(Code_postal) = 5
  AND SPLIT_PART(coordonnees_gps, ',', 1) ~ '^[0-9\.]+$'
  AND SPLIT_PART(coordonnees_gps, ',', 2) ~ '^[\-0-9\.]+$'
ORDER BY Code_postal, Libelle_acheminement, Code_commune_INSEE
ON CONFLICT (postal_code, name) DO NOTHING;

-- 4. Marquer villes majeures (population >50k)
UPDATE villes_france SET is_major = true
WHERE name IN (
  'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 
  'Montpellier', 'Strasbourg', 'Bordeaux', 'Lille', 'Rennes', 
  'Reims', 'Saint-Étienne', 'Toulon', 'Le Havre', 'Grenoble', 
  'Dijon', 'Angers', 'Nîmes', 'Villeurbanne', 'Saint-Denis',
  'Le Mans', 'Aix-en-Provence', 'Clermont-Ferrand', 'Brest',
  'Tours', 'Amiens', 'Limoges', 'Annecy', 'Perpignan'
);

-- 5. Cleanup
DROP TABLE IF EXISTS temp_codes_postaux;


-- ✅ VÉRIFICATION FINALE
-- =================================================================
SELECT 
  'Total villes' AS metric,
  COUNT(*)::TEXT AS value
FROM villes_france
UNION ALL
SELECT 
  'Villes majeures',
  COUNT(*)::TEXT
FROM villes_france 
WHERE is_major = true
UNION ALL
SELECT 
  'Départements',
  COUNT(DISTINCT department_code)::TEXT
FROM villes_france;

-- Résultat attendu :
-- Total villes: ~36000 (si import complet) ou ~30 (si manuel)
-- Villes majeures: ~30
-- Départements: ~100


-- ✅ IMPORT TERMINÉ
-- Passer aux tests frontend
