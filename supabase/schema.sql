-- Soap Hub schema — single-user app, no authentication.
-- Run this in the Supabase SQL editor for your project.

create extension if not exists "pgcrypto";

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  data jsonb not null, -- serialized Recipe (see src/lib/types.ts)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists custom_oils (
  id uuid primary key default gen_random_uuid(),
  data jsonb not null, -- serialized Oil (see src/lib/types.ts)
  created_at timestamptz not null default now()
);

create table if not exists custom_scents (
  id uuid primary key default gen_random_uuid(),
  data jsonb not null, -- serialized Scent (see src/lib/types.ts)
  created_at timestamptz not null default now()
);

-- Row Level Security: enabled with a fully-open policy rather than disabled,
-- since Supabase strongly recommends RLS be on for any client-exposed table.
-- This app has no login, so "open to anyone with the anon key" is the only
-- option — see README for why the deployed URL itself needs protecting
-- (e.g. Vercel deployment protection) instead of app-level access control.
alter table recipes enable row level security;
alter table custom_oils enable row level security;
alter table custom_scents enable row level security;

create policy "public read/write recipes" on recipes
  for all using (true) with check (true);
create policy "public read/write custom_oils" on custom_oils
  for all using (true) with check (true);
create policy "public read/write custom_scents" on custom_scents
  for all using (true) with check (true);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger recipes_set_updated_at
  before update on recipes
  for each row execute function set_updated_at();
