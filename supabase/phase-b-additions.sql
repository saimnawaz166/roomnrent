-- RoomieRents — Phase B additions
--
-- Run this ONCE in the Supabase SQL Editor, AFTER schema.sql. Adds a handful
-- of columns the UI needs that weren't in the original schema (discovered
-- while wiring the admin dashboard, reports, and support tickets to real
-- data). Idempotent — safe to re-run.

alter table public.listings add column if not exists flagged boolean not null default false;

alter table public.profiles add column if not exists status text not null default 'active'
  check (status in ('active', 'suspended'));

alter table public.reports add column if not exists target_label text;
alter table public.reports add column if not exists reported_by_name text;

alter table public.support_tickets add column if not exists from_name text;
alter table public.support_tickets add column if not exists type text;

-- favorites_all_own only lets a renter see their OWN saved listings — admin
-- needs to see anyone's for the admin User Detail page.
drop policy if exists "favorites_admin_select" on public.favorites;
create policy "favorites_admin_select" on public.favorites
  for select using (is_admin());
