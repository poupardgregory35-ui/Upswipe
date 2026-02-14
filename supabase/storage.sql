-- Enable the storage extension if not already enabled
-- create extension if not exists "storage";

-- Create specific buckets (cvs and videos are PRIVATE now)
insert into storage.buckets (id, name, public)
values 
  ('cvs', 'cvs', false),
  ('videos', 'videos', false)
on conflict (id) do update set public = false;

-- Set up security policies for 'cvs' bucket
-- DROP existing policies if any to avoid conflicts or just use create if not exists logic (Postgres doesn't support create policy if not exists natively simply)
-- For simplicity in this script, we'll try to drop then create or just create. 
-- Since I cannot easily check existence in simple SQL script without blocks, I will assume clean state or overwrite.
-- Actually, best practice for these scripts is to be idempotent.

drop policy if exists "Recruiter Access CVs" on storage.objects;
drop policy if exists "Upload CVs" on storage.objects;
drop policy if exists "Public Access CVs" on storage.objects;

create policy "Recruiter Access CVs"
  on storage.objects for select
  using ( bucket_id = 'cvs' and auth.role() = 'authenticated' );

create policy "Upload CVs"
  on storage.objects for insert
  with check ( bucket_id = 'cvs' and auth.role() = 'authenticated' );

-- Set up security policies for 'videos' bucket
drop policy if exists "Recruiter Access Videos" on storage.objects;
drop policy if exists "Upload Videos" on storage.objects;
drop policy if exists "Public Access Videos" on storage.objects;

create policy "Recruiter Access Videos"
  on storage.objects for select
  using ( bucket_id = 'videos' and auth.role() = 'authenticated' );

create policy "Upload Videos"
  on storage.objects for insert
  with check ( bucket_id = 'videos' and auth.role() = 'authenticated' );
