-- 🚑 FIX OFFRE DE SAV

-- 1. On remet la colonne 'city' (Texte) pour que ton formulaire React marche
-- (Car ton code frontend essaie d'insérer dans 'city', et pas 'city_id')
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS city TEXT;

-- 2. On crée une fonction SUPER INTELLIGENTE qui va transformer ton texte "75000 - Paris"
-- en un vrai ID (city_id) pour que la géolocalisation fonctionne
CREATE OR REPLACE FUNCTION public.calculate_job_city_id()
RETURNS TRIGGER AS $$
DECLARE
    v_found_id INT;
BEGIN
    -- Si on a une ville texte mais pas d'ID
    IF NEW.city IS NOT NULL AND NEW.city_id IS NULL THEN
        -- On essaie de trouver l'ID en cherchant dans villes_france
        -- Ex: "75001 - Paris" -> on cherche "Paris" ou "75001"
        SELECT id INTO v_found_id
        FROM villes_france
        WHERE 
            -- Cas 1: Match exact du nom
            name ILIKE NEW.city
            -- Cas 2: Format "75000 - Paris" -> on prend la partie après " - "
            OR name ILIKE TRIM(SPLIT_PART(NEW.city, '-', 2))
            -- Cas 3: Match sur le code postal (début de la string)
            OR zip_code = TRIM(SPLIT_PART(NEW.city, ' ', 1))
        LIMIT 1;

        -- Si on trouve, on remplit l'ID !
        IF v_found_id IS NOT NULL THEN
            NEW.city_id := v_found_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. On branche le Trigger (il s'active AVANT l'insertion)
DROP TRIGGER IF EXISTS trigger_calculate_job_city_id ON public.jobs;
CREATE TRIGGER trigger_calculate_job_city_id
BEFORE INSERT OR UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.calculate_job_city_id();

-- 4. Petit bonus : On met à jour les offres existantes qui n'auraient pas d'ID
UPDATE jobs 
SET city_id = (SELECT id FROM villes_france WHERE name ILIKE TRIM(SPLIT_PART(jobs.city, '-', 2)) LIMIT 1)
WHERE city IS NOT NULL AND city_id IS NULL;

-- Et voilà ! React envoie du texte -> Postgres calcule l'ID -> Matching fonctionne !
