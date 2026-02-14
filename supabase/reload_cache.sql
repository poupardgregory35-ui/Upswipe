-- Force le rechargement du cache de l'API Supabase (PostgREST)
-- Cela permet à l'API de "voir" les nouvelles fonctions que l'on vient de créer.

NOTIFY pgrst, 'reload config';
