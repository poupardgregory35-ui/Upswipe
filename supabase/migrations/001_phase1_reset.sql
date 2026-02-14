-- MIGRATION: 001_phase1_reset.sql
-- DESCRIPTION: Reset Schema with Business Columns & RLS

-- 1. CLEANUP (Drop existing)
drop table if exists matches cascade;
drop table if exists swipes cascade;
drop table if exists jobs cascade;
drop table if exists profiles cascade;

-- 2. PROFILES (Users and Companies)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role text check (role in ('candidate', 'recruiter')),
  full_name text,
  avatar_url text,
  
  -- Business Columns (Candidate)
  phone text,
  city text,
  badges text[], -- ex: ['DEA', 'Permis B']
  description text,
  
  -- Business Columns (Recruiter)
  company_name text,
  company_city text,
  company_type text, -- 'ambulance', 'taxi', 'vsl'
  
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. JOBS (Offres)
create table jobs (
  id uuid default gen_random_uuid() primary key,
  recruiter_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  required_badges text[], -- ex: ['DEA'] matching candidate badges
  salary int,
  schedule text, -- 'jour', 'nuit', 'roulement'
  city text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. SWIPES ( Interactions)
create table swipes (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references jobs(id) on delete cascade,
  candidate_id uuid references profiles(id) on delete cascade,
  recruiter_id uuid references profiles(id) on delete cascade,
  direction text check (direction in ('left', 'right')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. MATCHES (Result of mutual interest)
create table matches (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references jobs(id) on delete cascade,
  candidate_id uuid references profiles(id) on delete cascade,
  recruiter_id uuid references profiles(id) on delete cascade,
  status text check (status in ('pending', 'accepted', 'rejected', 'hired')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. RLS POLICIES

-- Profiles
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);

-- Jobs
alter table jobs enable row level security;
create policy "Jobs are viewable by everyone" on jobs for select using (true);
create policy "Recruiters can insert jobs" on jobs for insert with check (auth.uid() = recruiter_id);
create policy "Recruiters can update own jobs" on jobs for update using (auth.uid() = recruiter_id);

-- Swipes
alter table swipes enable row level security;
create policy "Swipes viewable by participants" on swipes for select using (auth.uid() = candidate_id or auth.uid() = recruiter_id);
create policy "Insert swipes" on swipes for insert with check (auth.uid() = candidate_id or auth.uid() = recruiter_id);

-- Matches
alter table matches enable row level security;
create policy "Matches viewable by participants" on matches for select using (auth.uid() = candidate_id or auth.uid() = recruiter_id);
