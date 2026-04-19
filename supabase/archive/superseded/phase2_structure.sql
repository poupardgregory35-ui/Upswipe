-- PHASE 2.1: CANDIDATE PROFILE & SECURITY

-- 1. STORAGE (Secure Bucket)
insert into storage.buckets (id, name, public)
values ('candidate-cvs', 'candidate-cvs', false)
on conflict (id) do nothing;

-- RLS for Storage (Strict User Isolation)
create policy "Candidate Insert Own CV"
on storage.objects for insert
with check (
  bucket_id = 'candidate-cvs' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Candidate View Own CV"
on storage.objects for select
using (
  bucket_id = 'candidate-cvs' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. TABLES (Business Structure)

-- Jobs (Redefined for MVP)
drop table if exists applications;
drop table if exists matches;
drop table if exists swipes;
drop table if exists jobs;

create table jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  city text not null,
  salary integer,
  type text check (type in ('CDI', 'CDD', 'Interim')),
  required_license text, -- 'B', 'C', 'D', 'B,D'
  created_at timestamp with time zone default now()
);

-- Applications (Link Candidate -> Job)
create table applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  candidate_id uuid references profiles(id) on delete cascade,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamp with time zone default now()
);

-- RLS for Tables
alter table jobs enable row level security;
create policy "Jobs viewable by everyone" on jobs for select using (true);
create policy "Recruiters insert jobs" on jobs for insert with check (true); -- Simplification for MVP

alter table applications enable row level security;
create policy "Candidates view own apps" on applications for select using (auth.uid() = candidate_id);
create policy "Candidates insert apps" on applications for insert with check (auth.uid() = candidate_id);
