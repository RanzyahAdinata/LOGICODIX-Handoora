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

-- Index untuk performa query email dan papan skor (leaderboard)
create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists profiles_xp_idx on public.profiles (xp desc);
create index if not exists profiles_weekly_xp_idx on public.profiles (weekly_xp desc);

-- 2. Berikan hak akses tabel ke role Data API Supabase
grant select on table public.profiles to anon;
grant select, insert, update on table public.profiles to authenticated;

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
  using ( (select auth.uid()) = id )
  with check ( (select auth.uid()) = id );

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
-- 5. Kredensial Akun Pengujian & Juri (Opsional di Supabase Dashboard)
-- Jika email demo.handoora@gmail.com didaftarkan dan ingin dikonfirmasi langsung:
-- UPDATE auth.users SET email_confirmed_at = now() WHERE email = 'demo.handoora@gmail.com';
-- ============================================================
