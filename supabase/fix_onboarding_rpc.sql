-- 🚑 CORRECTIF ONBOARDING (Pour les futurs inscrits)
-- Ce script modifie la fonction d'enregistrement pour lier automatiquement la ville (city_id).

CREATE OR REPLACE FUNCTION candidate_profile_save_v2(
    p_user_id UUID,
    p_diploma TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_photo_url TEXT DEFAULT NULL,
    p_presentation_type TEXT DEFAULT NULL,
    p_cv_url TEXT DEFAULT NULL,
    p_video_url TEXT DEFAULT NULL,
    p_pitch TEXT DEFAULT NULL,
    p_tags TEXT[] DEFAULT NULL,
    p_available BOOLEAN DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_city_id INTEGER;
  v_zip_code TEXT;
BEGIN
  -- 1. Trouver l'ID de la ville à partir de la chaîne "code - ville"
  -- Format attendu: "69002 - Lyon" -> on prend "69002"
  IF p_city IS NOT NULL THEN
     v_zip_code := SPLIT_PART(p_city, ' - ', 1);
     
     -- Chercher dans villes_france
     SELECT id INTO v_city_id 
     FROM villes_france 
     WHERE postal_code = v_zip_code 
     LIMIT 1;
  END IF;

  -- 2. Mise à jour du profil
  UPDATE public.profiles SET
    candidate_diploma = COALESCE(p_diploma, public.profiles.candidate_diploma),
    candidate_city = COALESCE(p_city, public.profiles.candidate_city),
    city_id = COALESCE(v_city_id, public.profiles.city_id), -- 👈 AJOUT MAJEUR ICI
    
    candidate_photo_url = COALESCE(p_photo_url, public.profiles.candidate_photo_url),
    candidate_presentation_type = COALESCE(p_presentation_type, public.profiles.candidate_presentation_type),
    candidate_cv_url = COALESCE(p_cv_url, public.profiles.candidate_cv_url),
    candidate_video_url = COALESCE(p_video_url, public.profiles.candidate_video_url),
    candidate_pitch = COALESCE(p_pitch, public.profiles.candidate_pitch),
    candidate_tags = COALESCE(p_tags, public.profiles.candidate_tags),
    is_available = COALESCE(p_available, public.profiles.is_available),
    candidate_onboarding_completed = true,
    updated_at = NOW()
  WHERE public.profiles.id = p_user_id
  RETURNING row_to_json(public.profiles.*) INTO v_result;

  IF v_result IS NULL THEN
      RAISE EXCEPTION 'Utilisateur introuvable (ID: %).', p_user_id;
  END IF;

  RETURN v_result;
END;
$$;

SELECT '✅ ONBOARDING RÉPARÉ (Nouveaux inscrits auront une ville)' as status;
