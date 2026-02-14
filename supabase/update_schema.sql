-- Add first_name and role which are missing
alter table profiles 
add column if not exists first_name text,
add column if not exists role text check (role in ('candidat', 'recruteur'));
