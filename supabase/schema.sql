-- ============================================================
-- Handoora Supabase Database Schema & Row Level Security (RLS)
-- Jalankan script ini di Supabase SQL Editor:
-- https://supabase.com/dashboard/project/wynafhzfnijtnnhqabxi/sql/new
-- ============================================================

-- Aktifkan extension pgcrypto untuk hashing password yang aman di database
create extension if not exists pgcrypto;

-- 1. Buat tabel public.profiles untuk menyimpan seluruh data pengguna & progres
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nama text not null,
  umur integer,
  email text unique not null,
  password_hash text,
  auth_provider text default 'email' not null,
  avatar_url text,
  xp integer default 0 not null,
  weekly_xp integer default 0 not null,
  weekly_cycle_id text,
  streak integer default 0 not null,
  gems integer default 500 not null,
  hearts integer default 5 not null,
  current_unit integer default 1 not null,
  completed_lessons jsonb default '[]'::jsonb not null,
  unlocked_islands jsonb default '[1]'::jsonb not null,
  last_activity_date date,
  streak_history jsonb default '[]'::jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Pastikan seluruh kolom tambahan tersedia jika tabel public.profiles sudah dibuat sebelumnya
alter table public.profiles add column if not exists umur integer;
alter table public.profiles add column if not exists password_hash text;
alter table public.profiles add column if not exists auth_provider text default 'email' not null;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists xp integer default 0 not null;
alter table public.profiles add column if not exists weekly_xp integer default 0 not null;
alter table public.profiles add column if not exists weekly_cycle_id text;
alter table public.profiles add column if not exists streak integer default 0 not null;
alter table public.profiles add column if not exists gems integer default 500 not null;
alter table public.profiles add column if not exists hearts integer default 5 not null;
alter table public.profiles add column if not exists current_unit integer default 1 not null;
alter table public.profiles add column if not exists completed_lessons jsonb default '[]'::jsonb not null;
alter table public.profiles add column if not exists unlocked_islands jsonb default '[1]'::jsonb not null;
alter table public.profiles add column if not exists last_activity_date date;
alter table public.profiles add column if not exists streak_history jsonb default '[]'::jsonb not null;
alter table public.profiles add column if not exists created_at timestamp with time zone default timezone('utc'::text, now()) not null;
alter table public.profiles add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Index untuk performa query email dan papan skor (leaderboard)
create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists profiles_xp_idx on public.profiles (xp desc);
create index if not exists profiles_weekly_xp_idx on public.profiles (weekly_xp desc);

-- 2. Berikan hak akses tabel ke role Data API Supabase
grant select on table public.profiles to anon;
grant select, insert, update, delete on table public.profiles to authenticated;

-- 3. Aktifkan Row Level Security (RLS) yang aman sesuai standar Supabase
alter table public.profiles enable row level security;

drop policy if exists "Profil publik untuk papan skor" on public.profiles;
create policy "Profil publik untuk papan skor"
  on public.profiles for select
  to anon, authenticated
  using ( true );

drop policy if exists "Pengguna hanya dapat membuat profil miliknya sendiri" on public.profiles;
create policy "Pengguna hanya dapat membuat profil miliknya sendiri"
  on public.profiles for insert
  to authenticated
  with check ( (select auth.uid()) = id );

drop policy if exists "Pengguna hanya dapat mengubah profil miliknya sendiri" on public.profiles;
create policy "Pengguna hanya dapat mengubah profil miliknya sendiri"
  on public.profiles for update
  to authenticated
  using ( (select auth.uid()) = id or (select auth.jwt() ->> 'email') = 'admin@gmail.com' )
  with check ( (select auth.uid()) = id or (select auth.jwt() ->> 'email') = 'admin@gmail.com' );

drop policy if exists "Admin dapat membuat profil pengguna" on public.profiles;
create policy "Admin dapat membuat profil pengguna"
  on public.profiles for insert
  to authenticated
  with check ( (select auth.uid()) = id or (select auth.jwt() ->> 'email') = 'admin@gmail.com' );

drop policy if exists "Admin dapat menghapus profil pengguna" on public.profiles;
create policy "Admin dapat menghapus profil pengguna"
  on public.profiles for delete
  to authenticated
  using ( (select auth.jwt() ->> 'email') = 'admin@gmail.com' );

-- 4. Trigger otomatis: Saat user daftar/login dengan Google atau Email di auth.users,
--    otomatis simpan Nama, Email, Avatar, Umur, dan Password Hash ke public.profiles!
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    nama,
    umur,
    email,
    password_hash,
    auth_provider,
    avatar_url
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'nama',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    nullif(new.raw_user_meta_data->>'umur', '')::integer,
    new.email,
    coalesce(new.raw_user_meta_data->>'password_hash', new.encrypted_password),
    coalesce(new.raw_app_meta_data->>'provider', 'email'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  )
  on conflict (id) do update set
    nama = coalesce(excluded.nama, public.profiles.nama),
    auth_provider = coalesce(excluded.auth_provider, public.profiles.auth_provider),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 5. Fungsi RPC Admin (/adminhandoora) agar CRUD Admin langsung
--    memengaruhi public.profiles & auth.users secara konsisten
-- ============================================================
create or replace function public.is_handoora_admin(p_email text, p_token text)
returns boolean
language sql
immutable
as $$
  select lower(trim(coalesce(p_email, ''))) = 'admin@gmail.com'
     and coalesce(p_token, '') = 'pbkdf2_sha256$100000$8518bc21dad2bb168c13d896643bc60dee9129074cdd5110aa50cc7f300f6242';
$$;

create or replace function public.admin_upsert_profile(
  p_admin_email text,
  p_admin_token text,
  p_user_id uuid,
  p_nama text,
  p_umur integer,
  p_email text,
  p_password_hash text,
  p_auth_provider text default 'email',
  p_xp integer default 0,
  p_streak integer default 0,
  p_gems integer default 500,
  p_hearts integer default 5,
  p_current_unit integer default 1,
  p_completed_lessons jsonb default '[]'::jsonb,
  p_unlocked_islands jsonb default '[1]'::jsonb
)
returns jsonb
language plpgsql
security definer set search_path = public, extensions
as $$
declare
  v_row public.profiles;
begin
  if not public.is_handoora_admin(p_admin_email, p_admin_token) then
    raise exception 'Akses admin ditolak.';
  end if;

  update auth.users
  set
    email_confirmed_at = coalesce(email_confirmed_at, now()),
    raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
      'nama', p_nama,
      'full_name', p_nama,
      'umur', p_umur
    )
  where id = p_user_id;

  insert into public.profiles (
    id, nama, umur, email, password_hash, auth_provider,
    xp, weekly_xp, streak, gems, hearts, current_unit,
    completed_lessons, unlocked_islands, updated_at
  )
  values (
    p_user_id, p_nama, p_umur, lower(trim(p_email)), p_password_hash, coalesce(p_auth_provider, 'email'),
    greatest(0, coalesce(p_xp, 0)), greatest(0, coalesce(p_xp, 0)),
    greatest(0, coalesce(p_streak, 0)), greatest(0, coalesce(p_gems, 500)),
    least(5, greatest(0, coalesce(p_hearts, 5))), least(6, greatest(1, coalesce(p_current_unit, 1))),
    coalesce(p_completed_lessons, '[]'::jsonb), coalesce(p_unlocked_islands, '[1]'::jsonb), now()
  )
  on conflict (id) do update set
    nama = excluded.nama,
    umur = excluded.umur,
    email = excluded.email,
    password_hash = coalesce(excluded.password_hash, public.profiles.password_hash),
    xp = excluded.xp,
    weekly_xp = excluded.weekly_xp,
    streak = excluded.streak,
    gems = excluded.gems,
    hearts = excluded.hearts,
    current_unit = excluded.current_unit,
    completed_lessons = excluded.completed_lessons,
    unlocked_islands = excluded.unlocked_islands,
    updated_at = now()
  returning * into v_row;

  return to_jsonb(v_row);
end;
$$;

create or replace function public.admin_update_profile(
  p_admin_email text,
  p_admin_token text,
  p_user_id uuid,
  p_nama text,
  p_umur integer,
  p_email text,
  p_xp integer,
  p_streak integer,
  p_gems integer,
  p_hearts integer,
  p_current_unit integer,
  p_completed_lessons jsonb,
  p_unlocked_islands jsonb,
  p_password_hash text default null,
  p_new_password text default null
)
returns jsonb
language plpgsql
security definer set search_path = public, extensions
as $$
declare
  v_row public.profiles;
  v_clean_email text := lower(trim(p_email));
begin
  if not public.is_handoora_admin(p_admin_email, p_admin_token) then
    raise exception 'Akses admin ditolak.';
  end if;

  update auth.users
  set
    email = v_clean_email,
    raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
      'nama', p_nama,
      'full_name', p_nama,
      'umur', p_umur
    ),
    encrypted_password = case
      when p_new_password is not null and length(trim(p_new_password)) >= 6
        then crypt(trim(p_new_password), gen_salt('bf'))
      else encrypted_password
    end,
    updated_at = now()
  where id = p_user_id;

  update public.profiles
  set
    nama = p_nama,
    umur = p_umur,
    email = v_clean_email,
    xp = greatest(0, coalesce(p_xp, 0)),
    weekly_xp = greatest(0, coalesce(p_xp, 0)),
    streak = greatest(0, coalesce(p_streak, 0)),
    gems = greatest(0, coalesce(p_gems, 0)),
    hearts = least(5, greatest(0, coalesce(p_hearts, 5))),
    current_unit = least(6, greatest(1, coalesce(p_current_unit, 1))),
    completed_lessons = coalesce(p_completed_lessons, '[]'::jsonb),
    unlocked_islands = coalesce(p_unlocked_islands, '[1]'::jsonb),
    password_hash = coalesce(p_password_hash, password_hash),
    updated_at = now()
  where id = p_user_id
  returning * into v_row;

  return to_jsonb(v_row);
end;
$$;

create or replace function public.admin_delete_user(
  p_admin_email text,
  p_admin_token text,
  p_user_id uuid
)
returns boolean
language plpgsql
security definer set search_path = public, extensions
as $$
begin
  if not public.is_handoora_admin(p_admin_email, p_admin_token) then
    raise exception 'Akses admin ditolak.';
  end if;

  delete from public.profiles where id = p_user_id;
  delete from auth.users where id = p_user_id;
  return true;
end;
$$;

grant execute on function public.admin_upsert_profile(text, text, uuid, text, integer, text, text, text, integer, integer, integer, integer, integer, jsonb, jsonb) to anon, authenticated;
grant execute on function public.admin_update_profile(text, text, uuid, text, integer, text, integer, integer, integer, integer, integer, jsonb, jsonb, text, text) to anon, authenticated;
grant execute on function public.admin_delete_user(text, text, uuid) to anon, authenticated;

-- ============================================================
-- 6. Kredensial Akun Pengujian & Juri (Opsional di Supabase Dashboard)
-- Jika email demo.handoora@gmail.com didaftarkan dan ingin dikonfirmasi langsung:
-- UPDATE auth.users SET email_confirmed_at = now() WHERE email = 'demo.handoora@gmail.com';
-- ============================================================
