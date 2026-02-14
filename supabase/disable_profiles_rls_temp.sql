-- 🚨 SCRIPT DE DÉBLOCAGE RADICAL (Désactive la sécurité RLS sur profiles)
-- On désactive temporairement la sécurité ligne par ligne pour voir si c'est ça qui bloque.

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

SELECT '✅ RLS DÉSACTIVÉ SUR PROFILES' as status;
