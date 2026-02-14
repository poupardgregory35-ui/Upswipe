-- SEED DATA
-- NOTE: In a real Supabase Auth environment, you cannot INSERT into 'profiles' directly 
-- if the 'id' does not exist in 'auth.users'.
--
-- INSTRUCTIONS:
-- 1. Sign up 2 Users manually for Recruiters (e.g., rec1@test.com, rec2@test.com)
-- 2. Sign up 5 Users manually for Candidates (e.g., can1@test.com, ... can5@test.com)
-- 3. Replace the UUIDs below with the actual User IDs from Authentication > Users

-- EXAMPLE SEED (Replace 'RECRUITER_1_UUID' with actual ID)

/*
-- Update Recruiters
UPDATE profiles 
SET 
  role = 'recruiter',
  company_name = 'Jussieu Secours',
  company_city = 'Paris',
  company_type = 'ambulance'
WHERE email = 'rec1@test.com';

-- Insert Jobs for Recruiter 1
INSERT INTO jobs (recruiter_id, title, description, required_badges, salary, schedule, city)
VALUES 
  ('RECRUITER_1_UUID', 'Ambulancier DEA Urgences', 'Poste de nuit, gardes SAMU.', ARRAY['DEA', 'Permis B'], 2200, 'nuit', 'Paris'),
  ('RECRUITER_1_UUID', 'Chauffeur VSL', 'Transport assis, horaires fixes.', ARRAY['Auxiliaire', 'Permis B'], 1800, 'jour', 'Paris');

-- Update Candidates
UPDATE profiles 
SET 
  role = 'candidate',
  full_name = 'Thomas Anderson',
  city = 'Paris',
  badges = ARRAY['DEA', 'Permis B'],
  phone = '0600000001'
WHERE email = 'can1@test.com';

*/
