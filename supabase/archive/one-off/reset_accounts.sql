-- ⚠️ DANGER ZONE: This script deletes ALL accounts and data ⚠️

-- 1. Clean up public tables (Application Data)
TRUNCATE TABLE public.swipes CASCADE;
TRUNCATE TABLE public.matches CASCADE;
TRUNCATE TABLE public.jobs CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- 2. Delete Users from Auth (Login Credentials)
-- This removes the actual accounts from Supabase Auth
DELETE FROM auth.users;

-- 3. (Optional) Re-seed data if needed
-- To add demo data back, run the contents of seed.sql or seed_jobs.sql
