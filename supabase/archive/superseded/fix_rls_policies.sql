-- FIX RLS POLICIES FOR ALL TABLES

-- 1. PROFILES
alter table profiles enable row level security;
drop policy if exists "Public profiles" on profiles;
drop policy if exists "Insert profiles" on profiles;
drop policy if exists "Update profiles" on profiles;

create policy "Public profiles" on profiles for select using (true);
create policy "Insert profiles" on profiles for insert with check (true);
create policy "Update profiles" on profiles for update using (true);

-- 2. JOBS
alter table jobs enable row level security;
drop policy if exists "Public jobs" on jobs;
drop policy if exists "Insert jobs" on jobs;
drop policy if exists "Update jobs" on jobs;
drop policy if exists "Delete jobs" on jobs;

create policy "Public jobs" on jobs for select using (true);
create policy "Insert jobs" on jobs for insert with check (true);
create policy "Update jobs" on jobs for update using (true);
create policy "Delete jobs" on jobs for delete using (true);

-- 3. SWIPES
alter table swipes enable row level security;
drop policy if exists "Public swipes" on swipes;
drop policy if exists "Insert swipes" on swipes;

create policy "Public swipes" on swipes for select using (true);
create policy "Insert swipes" on swipes for insert with check (true);

-- 4. MATCHES
alter table matches enable row level security;
drop policy if exists "Public matches" on matches;
drop policy if exists "Insert matches" on matches;
drop policy if exists "Update matches" on matches;

create policy "Public matches" on matches for select using (true);
create policy "Insert matches" on matches for insert with check (true);
create policy "Update matches" on matches for update using (true);
