-- ═══════════════════════════════════════════════════════════════════
-- JoyJump Phase 1b — Auth Upgrade SQL
--
-- Run this AFTER:
--   1. Running supabase-schema-v4.sql (Phase 1 base schema)
--   2. Enabling Email (magic link) provider in Supabase Auth settings
--      → Supabase Dashboard → Authentication → Providers → Email → Enable
--   3. Setting Site URL in Supabase Auth settings
--      → Authentication → URL Configuration → Site URL → your Vercel URL
--
-- This script:
--   • Creates parent_profiles table (linked to auth.users)
--   • Adds trigger to auto-create profile on signup
--   • Tightens RLS so parents can only see their own children
-- ═══════════════════════════════════════════════════════════════════

-- ── Parent profiles (extends auth.users) ────────────────────────
create table if not exists parent_profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  email      text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create a parent_profile row when any user signs up
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into parent_profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop existing trigger if present, then recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure handle_new_user();

-- ── Add parent_profiles RLS ──────────────────────────────────────
alter table parent_profiles enable row level security;

drop policy if exists "parent_profiles_own" on parent_profiles;
create policy "parent_profiles_own"
  on parent_profiles for all
  using (id = auth.uid())
  with check (id = auth.uid());

-- ── Tighten children RLS ─────────────────────────────────────────
-- Remove the open demo policy and replace with auth-scoped policy.
drop policy if exists "children_open" on children;

create policy "children_auth_scoped"
  on children for all
  using (
    -- Authenticated: only own children
    (auth.uid() is not null and parent_auth_id = auth.uid())
    or
    -- Demo mode: rows with no parent_auth_id are accessible (legacy localStorage)
    (auth.uid() is null and parent_auth_id is null)
  )
  with check (
    (auth.uid() is not null and parent_auth_id = auth.uid())
    or
    (auth.uid() is null and parent_auth_id is null)
  );

-- ── Tighten progress RLS ─────────────────────────────────────────
drop policy if exists "progress_open" on progress;

create policy "progress_auth_scoped"
  on progress for all
  using (
    child_id in (
      select id from children
      where
        (auth.uid() is not null and parent_auth_id = auth.uid())
        or
        (auth.uid() is null and parent_auth_id is null)
    )
  );

-- ── Tighten attempt_logs RLS ─────────────────────────────────────
drop policy if exists "attempts_insert" on attempt_logs;
drop policy if exists "attempts_read"   on attempt_logs;

create policy "attempts_auth_scoped"
  on attempt_logs for all
  using (
    child_id in (
      select id from children
      where
        (auth.uid() is not null and parent_auth_id = auth.uid())
        or
        (auth.uid() is null and parent_auth_id is null)
    )
  );

-- ── Tighten session_logs RLS ─────────────────────────────────────
drop policy if exists "sessions_insert" on session_logs;
drop policy if exists "sessions_read"   on session_logs;

create policy "sessions_auth_scoped"
  on session_logs for all
  using (
    child_id in (
      select id from children
      where
        (auth.uid() is not null and parent_auth_id = auth.uid())
        or
        (auth.uid() is null and parent_auth_id is null)
    )
  );

-- ── Tighten badges RLS ───────────────────────────────────────────
drop policy if exists "badges_open" on badges;

create policy "badges_auth_scoped"
  on badges for all
  using (
    child_id in (
      select id from children
      where
        (auth.uid() is not null and parent_auth_id = auth.uid())
        or
        (auth.uid() is null and parent_auth_id is null)
    )
  );

-- ── Done ─────────────────────────────────────────────────────────
-- After running this script:
--   • New parents who click a magic link get a parent_profiles row
--   • Their child data (childId from localStorage) is linked on first login
--   • All progress data is protected — parents only see their own children
--   • Demo mode still works (parent_auth_id = null rows remain accessible)
