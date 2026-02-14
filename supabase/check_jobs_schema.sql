-- 🕵️ CHECK JOBS TABLE STRUCTURE
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'jobs';
