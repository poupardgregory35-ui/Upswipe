-- 🕵️ VERIFICATION APPLICATION
-- On regarde si ta candidature a été enregistrée en base

SELECT * 
FROM applications 
WHERE candidate_id = '67d022cc-96d2-4dd7-a530-ca44db740b35' -- Ton ID Candidat
AND job_id = '4d980fc0-5881-42fe-a5f5-2472733ae8a4';     -- Ton ID Offre

-- Si ça retourne une ligne : C'est le Dashboard Recruteur qui bug (il n'affiche pas les résultats).
-- Si ça retourne RIEN : C'est le Swipe qui a échoué (ou pas été fait).
