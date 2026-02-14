
-- Update company name for recruiter
UPDATE profiles 
SET recruiter_company_name = 'ASA Assistance' 
WHERE recruiter_company_name ILIKE '%Jussieu%';

-- Verify update
SELECT * FROM profiles WHERE recruiter_company_name = 'ASA Assistance';
