-- Table des profils (Candidats et Recruteurs)
create table profiles (
  id uuid default gen_random_uuid() primary key,
  role text check (role in ('candidat', 'recruteur')),
  nom text, -- ou first_name / company_name selon implémentation front
  first_name text,
  company_name text,
  company_city text,
  phone text,
  badges text[], -- ex: ['DEA', 'Auxiliaire'] ou badge simple
  badge text,
  zone_km int,
  zone_city text,
  zone_radius_km int,
  video_url text, -- L'URL de ta vidéo stockée
  experience_level text,
  availability text[],
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Table des jobs (Offres)
create table jobs (
  id uuid default gen_random_uuid() primary key,
  recruiter_id uuid references profiles(id),
  titre text, -- ex: "Garde de nuit SMUR"
  badge_required text,
  schedule text,
  salary int,
  ville text,
  city text, -- alias pour ville
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Table des Swipes
create table swipes (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references jobs(id),
  candidate_id uuid references profiles(id),
  recruiter_id uuid references profiles(id),
  direction text check (direction in ('left', 'right')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Table des Matchs
create table matches (
  id uuid default gen_random_uuid() primary key,
  candidat_id uuid references profiles(id),
  candidate_id uuid references profiles(id), -- alias
  job_id uuid references jobs(id),
  recruiter_id uuid references profiles(id),
  status text check (status in ('liked', 'rejected', 'matched', 'pending', 'hired')),
  score int,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Policies (Basic)
alter table profiles enable row level security;
alter table jobs enable row level security;
alter table swipes enable row level security;
alter table matches enable row level security;

create policy "Public profiles" on profiles for select using (true);
create policy "Insert profiles" on profiles for insert with check (true);
create policy "Update profiles" on profiles for update using (true);

create policy "Public jobs" on jobs for select using (true);
create policy "Insert jobs" on jobs for insert with check (true);

create policy "Public swipes" on swipes for select using (true);
create policy "Insert swipes" on swipes for insert with check (true);

create policy "Public matches" on matches for select using (true);
create policy "Insert matches" on matches for insert with check (true);
create policy "Update matches" on matches for update using (true);
