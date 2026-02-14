-- PHASE 1: DB RESET & CLEANUP
-- CAUTION: This will wipe existing data structure to enforce the new strict MVP schema.

-- 1. Drop dependent tables to avoid FK conflicts
drop table if exists matches;
drop table if exists swipes;
drop table if exists jobs;
drop table if exists profiles;

-- 2. Create PROFILES table (Strict Schema)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role text check (role in ('candidate', 'recruiter')),
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Enable RLS and Open Access (Speed > Security for Demo)
alter table profiles enable row level security;

create policy "Public profiles access" 
on profiles for select 
using (true);

create policy "Self update profiles" 
on profiles for update 
using (auth.uid() = id);

create policy "Insert profiles" 
on profiles for insert 
with check (auth.uid() = id);

-- 4. Create other tables empty for now (will be filled in Phase 2/3/4)
-- We need them to exist so the app doesn't crash if it tries to fetch them, 
-- but we'll redefine their strict schema in their respective phases.
create table jobs (
  id uuid default gen_random_uuid() primary key,
  recruiter_id uuid references profiles(id),
  title text,
  description text,
  required_permits text[],
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table jobs enable row level security;
create policy "Public jobs" on jobs for select using (true);
create policy "Insert jobs" on jobs for insert with check (true);

