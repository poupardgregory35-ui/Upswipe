-- Mise à jour du trigger de création de profil
-- Permet de prendre en compte le rôle passé dans les metadata (pour les recruteurs)

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    is_available,
    created_at
  )
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Nouvel utilisateur'),
    -- Utilise le rôle passé dans les metadata, sinon 'candidate' par défaut
    COALESCE(new.raw_user_meta_data->>'role', 'candidate'), 
    false,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    email = EXCLUDED.email; -- Met à jour si existe déjà (utile pour les tests)
  
  RETURN new;
END;
$$;
