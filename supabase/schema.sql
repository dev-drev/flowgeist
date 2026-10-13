-- Flowgeist admin tables.
-- Promoters, clubs, events, notes, useful links, and assets.

create table if not exists public.admin_promoters (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  city text not null default '',
  country text not null default '',
  email text not null default '',
  phone text not null default '',
  instagram text not null default '',
  website text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  city text not null default '',
  country text not null default '',
  address text not null default '',
  capacity text not null default '',
  email text not null default '',
  phone text not null default '',
  instagram text not null default '',
  website text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_events (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  event_date text not null default '',
  city text not null default '',
  country text not null default '',
  venue text not null default '',
  promoter text not null default '',
  status text not null default 'upcoming',
  ticket_url text not null default '',
  website text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  body text not null default '',
  category text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_links (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  url text not null default '',
  category text not null default 'useful',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_assets (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  -- One URL, or a JSON array of { "name", "url" } when an asset has named links.
  url text not null default '',
  kind text not null default 'other',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_promoters enable row level security;
alter table public.admin_clubs enable row level security;
alter table public.admin_events enable row level security;
alter table public.admin_notes enable row level security;
alter table public.admin_links enable row level security;
alter table public.admin_assets enable row level security;

drop policy if exists "admin_promoters_all" on public.admin_promoters;
drop policy if exists "admin_clubs_all" on public.admin_clubs;
drop policy if exists "admin_events_all" on public.admin_events;
drop policy if exists "admin_notes_all" on public.admin_notes;
drop policy if exists "admin_links_all" on public.admin_links;
drop policy if exists "admin_assets_all" on public.admin_assets;

create policy "admin_promoters_all" on public.admin_promoters for all using (true) with check (true);
create policy "admin_clubs_all" on public.admin_clubs for all using (true) with check (true);
create policy "admin_events_all" on public.admin_events for all using (true) with check (true);
create policy "admin_notes_all" on public.admin_notes for all using (true) with check (true);
create policy "admin_links_all" on public.admin_links for all using (true) with check (true);
create policy "admin_assets_all" on public.admin_assets for all using (true) with check (true);

grant select, insert, update, delete on public.admin_promoters to anon, authenticated, service_role;
grant select, insert, update, delete on public.admin_clubs to anon, authenticated, service_role;
grant select, insert, update, delete on public.admin_events to anon, authenticated, service_role;
grant select, insert, update, delete on public.admin_notes to anon, authenticated, service_role;
grant select, insert, update, delete on public.admin_links to anon, authenticated, service_role;
grant select, insert, update, delete on public.admin_assets to anon, authenticated, service_role;
