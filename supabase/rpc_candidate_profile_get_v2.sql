CREATE OR REPLACE FUNCTION candidate_profile_get_v2(
    p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT row_to_json(p) INTO v_result
  FROM public.profiles p
  WHERE p.id = p_user_id;

  RETURN v_result;
END;
$$;
