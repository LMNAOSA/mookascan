-- Mooka Boys Digital Twin v0.1
-- Run in Supabase SQL Editor or via Supabase CLI migrations.

create extension if not exists pgcrypto;

create sequence if not exists public.stone_twin_seq start 1;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

create table if not exists public.stones (
  id uuid primary key default gen_random_uuid(),
  digital_twin_id text unique not null default ('MB-' || to_char(nextval('public.stone_twin_seq'), 'FM000000')),
  name text not null,
  stone_reference text,
  description text,
  status text not null default 'draft' check (status in ('draft', 'captured', 'processing', 'ready', 'archived')),
  weight numeric(12,3),
  length_mm numeric(12,3),
  width_mm numeric(12,3),
  height_mm numeric(12,3),
  origin text,
  location text,
  acquired_date date,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.capture_sessions (
  id uuid primary key default gen_random_uuid(),
  stone_id uuid not null references public.stones(id) on delete cascade,
  capture_date timestamptz not null default now(),
  captured_by uuid not null references auth.users(id) on delete restrict,
  device text,
  notes text,
  image_count integer not null default 0 check (image_count >= 0),
  processing_status text not null default 'not_processed' check (processing_status in ('not_processed', 'processing', 'processed', 'failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.capture_images (
  id uuid primary key default gen_random_uuid(),
  capture_session_id uuid not null references public.capture_sessions(id) on delete cascade,
  file_path text not null unique,
  file_name text not null,
  sequence integer not null default 1,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.models (
  id uuid primary key default gen_random_uuid(),
  stone_id uuid not null references public.stones(id) on delete cascade,
  capture_session_id uuid references public.capture_sessions(id) on delete set null,
  version integer not null default 1,
  file_path text not null unique,
  file_format text not null default 'glb',
  processing_engine text not null,
  processing_version text,
  texture_file_path text,
  polygon_count bigint,
  created_at timestamptz not null default now(),
  unique(stone_id, version)
);

create table if not exists public.processing_jobs (
  id uuid primary key default gen_random_uuid(),
  capture_session_id uuid not null references public.capture_sessions(id) on delete cascade,
  engine text not null,
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed')),
  external_job_id text,
  input_image_count integer not null default 0,
  output_model_id uuid references public.models(id) on delete set null,
  log text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.provenance (
  id uuid primary key default gen_random_uuid(),
  stone_id uuid not null references public.stones(id) on delete cascade,
  event_type text not null,
  description text not null,
  location text,
  person text,
  date date,
  source text,
  created_at timestamptz not null default now()
);

create index if not exists stones_created_by_idx on public.stones(created_by);
create index if not exists capture_sessions_stone_id_idx on public.capture_sessions(stone_id);
create index if not exists capture_images_capture_session_id_idx on public.capture_images(capture_session_id);
create index if not exists models_stone_id_idx on public.models(stone_id);
create index if not exists provenance_stone_id_idx on public.provenance(stone_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists stones_set_updated_at on public.stones;
create trigger stones_set_updated_at
before update on public.stones
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1))
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.next_model_version(p_stone_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_version integer;
begin
  select coalesce(max(version), 0) + 1 into next_version
  from public.models
  where stone_id = p_stone_id;
  return next_version;
end;
$$;

-- Row-level security
alter table public.profiles enable row level security;
alter table public.stones enable row level security;
alter table public.capture_sessions enable row level security;
alter table public.capture_images enable row level security;
alter table public.models enable row level security;
alter table public.processing_jobs enable row level security;
alter table public.provenance enable row level security;

-- Internal v0.1 team: authenticated users can inspect shared project records.
drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin on public.profiles
for select to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_own_or_admin on public.profiles;
create policy profiles_update_own_or_admin on public.profiles
for update to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists stones_select_authenticated on public.stones;
create policy stones_select_authenticated on public.stones
for select to authenticated using (true);

drop policy if exists stones_insert_authenticated on public.stones;
create policy stones_insert_authenticated on public.stones
for insert to authenticated with check (created_by = auth.uid() or public.is_admin());

drop policy if exists stones_update_creator_or_admin on public.stones;
create policy stones_update_creator_or_admin on public.stones
for update to authenticated
using (created_by = auth.uid() or public.is_admin())
with check (created_by = auth.uid() or public.is_admin());

drop policy if exists stones_delete_admin on public.stones;
create policy stones_delete_admin on public.stones
for delete to authenticated using (public.is_admin());

drop policy if exists capture_sessions_select_authenticated on public.capture_sessions;
create policy capture_sessions_select_authenticated on public.capture_sessions
for select to authenticated using (true);

drop policy if exists capture_sessions_write_authenticated on public.capture_sessions;
create policy capture_sessions_write_authenticated on public.capture_sessions
for insert to authenticated with check (captured_by = auth.uid() or public.is_admin());

drop policy if exists capture_sessions_update_authenticated on public.capture_sessions;
create policy capture_sessions_update_authenticated on public.capture_sessions
for update to authenticated using (true) with check (true);

drop policy if exists capture_sessions_delete_admin on public.capture_sessions;
create policy capture_sessions_delete_admin on public.capture_sessions
for delete to authenticated using (public.is_admin());

drop policy if exists capture_images_select_authenticated on public.capture_images;
create policy capture_images_select_authenticated on public.capture_images
for select to authenticated using (true);

drop policy if exists capture_images_write_authenticated on public.capture_images;
create policy capture_images_write_authenticated on public.capture_images
for insert to authenticated with check (true);

drop policy if exists capture_images_delete_admin on public.capture_images;
create policy capture_images_delete_admin on public.capture_images
for delete to authenticated using (public.is_admin());

drop policy if exists models_select_authenticated on public.models;
create policy models_select_authenticated on public.models
for select to authenticated using (true);

drop policy if exists models_write_authenticated on public.models;
create policy models_write_authenticated on public.models
for insert to authenticated with check (true);

drop policy if exists models_update_authenticated on public.models;
create policy models_update_authenticated on public.models
for update to authenticated using (true) with check (true);

drop policy if exists models_delete_admin on public.models;
create policy models_delete_admin on public.models
for delete to authenticated using (public.is_admin());

drop policy if exists processing_jobs_select_authenticated on public.processing_jobs;
create policy processing_jobs_select_authenticated on public.processing_jobs
for select to authenticated using (true);

drop policy if exists processing_jobs_write_authenticated on public.processing_jobs;
create policy processing_jobs_write_authenticated on public.processing_jobs
for insert to authenticated with check (true);

drop policy if exists processing_jobs_update_authenticated on public.processing_jobs;
create policy processing_jobs_update_authenticated on public.processing_jobs
for update to authenticated using (true) with check (true);

drop policy if exists provenance_select_authenticated on public.provenance;
create policy provenance_select_authenticated on public.provenance
for select to authenticated using (true);

drop policy if exists provenance_write_authenticated on public.provenance;
create policy provenance_write_authenticated on public.provenance
for insert to authenticated with check (true);

drop policy if exists provenance_update_authenticated on public.provenance;
create policy provenance_update_authenticated on public.provenance
for update to authenticated using (true) with check (true);

-- Storage buckets.
insert into storage.buckets (id, name, public)
values
  ('original-captures', 'original-captures', false),
  ('models', 'models', false),
  ('textures', 'textures', false),
  ('documents', 'documents', false)
on conflict (id) do nothing;

-- v0.1 is an authenticated internal lab. Storage is private to signed-in team members.
drop policy if exists storage_authenticated_read on storage.objects;
create policy storage_authenticated_read on storage.objects
for select to authenticated using (bucket_id in ('original-captures','models','textures','documents'));

drop policy if exists storage_authenticated_insert on storage.objects;
create policy storage_authenticated_insert on storage.objects
for insert to authenticated with check (bucket_id in ('original-captures','models','textures','documents'));

drop policy if exists storage_authenticated_update on storage.objects;
create policy storage_authenticated_update on storage.objects
for update to authenticated using (bucket_id in ('original-captures','models','textures','documents')) with check (bucket_id in ('original-captures','models','textures','documents'));

drop policy if exists storage_admin_delete on storage.objects;
create policy storage_admin_delete on storage.objects
for delete to authenticated using (bucket_id in ('original-captures','models','textures','documents') and public.is_admin());
