-- 🚑 SCRIPT DE RÉSURRECTION (Restaurer les profils supprimés)
-- Ce script va recréer les profils (public.profiles) pour TOUS les utilisateurs inscrits (auth.users)
-- qui n'ont plus de profil à cause de la suppression accidentelle.

-- 1. INSÉRER LES PROFILS MANQUANTS
INSERT INTO public.profiles (id, email, role, created_at, updated_at)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'role', 'candidate'), -- Récupère le rôle d'origine ou met 'candidate' par défaut
    created_at,
    NOW()
FROM auth.users
ON CONFLICT (id) DO NOTHING; -- Ne fait rien si le profil existe déjà

-- 2. DÉFINIR TON COMPTE COMME RECRUTEUR (Optionnel mais recommandé)
-- Remplace 'ton-email@exemple.com' par ton VRAI email si tu veux forcer le rôle.
-- UPDATE public.profiles SET role = 'recruiter' WHERE email = 'ton-email@exemple.com';

-- 3. VÉRIFICATION
SELECT count(*) as "Profils restaurés" FROM public.profiles;
