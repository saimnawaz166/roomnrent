-- RoomieRents — full database schema + Row Level Security
--
-- Run this ONCE in the Supabase Dashboard -> SQL Editor (or via the CLI).
-- Safe to re-run: every statement is idempotent (create-if-not-exists /
-- drop-if-exists patterns throughout).
--
-- Covers every data domain the frontend has today. Phase A of the backend
-- migration only wires `profiles`, `listings`, and `applications` into the
-- app; everything else here exists so later phases are pure app-code work,
-- not another migration.

create extension if not exists pgcrypto;

-- =========================================================================
-- 1. profiles — one row per auth.users row, extra app-specific fields
-- =========================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null,
  role text not null default 'renter' check (role in ('renter', 'landlord', 'admin')),
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Admin check used across every policy below — security definer so it can
-- read `profiles` even from inside another table's policy without recursion.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Auto-create a profile row whenever someone signs up. `name`/`role` come
-- from the metadata passed to supabase.auth.signUp() on the signup form.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'renter')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id or is_admin()) with check (auth.uid() = id or is_admin());

-- =========================================================================
-- 2. listings
-- =========================================================================
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references public.profiles (id) on delete cascade,
  landlord_name text,
  landlord_email text,
  title text not null,
  city text,
  neighborhood text,
  address text,
  zip text,
  price numeric not null default 0,
  period text not null default 'month' check (period in ('month', 'week')),
  beds int not null default 1,
  type text,
  room_type text,
  listing_type text not null default 'spare-room'
    check (listing_type in ('spare-room', 'lease-takeover-room', 'lease-takeover-full')),
  lease_end_date text,
  transfer_fee numeric,
  rating numeric not null default 0,
  reviews_count int not null default 0,
  tags text[] not null default '{}',
  furnished boolean not null default false,
  utilities_included boolean not null default false,
  current_pets_present boolean not null default false,
  status text not null default 'live' check (status in ('live', 'coming_soon', 'paused', 'rented')),
  blurb text,
  roommates text,
  bathroom_type text,
  min_stay text,
  deposit numeric,
  parking text,
  pet_policy text,
  smoking_policy text,
  amenities text[] not null default '{}',
  photos jsonb not null default '[]',
  available_from date,
  flagged boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.listings enable row level security;

drop policy if exists "listings_select" on public.listings;
create policy "listings_select" on public.listings
  for select using (status = 'live' or auth.uid() = landlord_id or is_admin());

drop policy if exists "listings_insert" on public.listings;
create policy "listings_insert" on public.listings
  for insert to authenticated with check (
    auth.uid() = landlord_id
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('landlord', 'admin') and status = 'active'
    )
  );

drop policy if exists "listings_update" on public.listings;
create policy "listings_update" on public.listings
  for update to authenticated using (auth.uid() = landlord_id or is_admin())
  with check (auth.uid() = landlord_id or is_admin());

drop policy if exists "listings_delete" on public.listings;
create policy "listings_delete" on public.listings
  for delete to authenticated using (auth.uid() = landlord_id or is_admin());

-- Real photo uploads (Phase B) — table + public bucket exist now so that's
-- pure app-code later, not another schema change.
create table if not exists public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  storage_path text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.listing_photos enable row level security;

drop policy if exists "listing_photos_select" on public.listing_photos;
create policy "listing_photos_select" on public.listing_photos
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and (l.status = 'live' or l.landlord_id = auth.uid() or is_admin())
    )
  );

drop policy if exists "listing_photos_write" on public.listing_photos;
create policy "listing_photos_write" on public.listing_photos
  for all to authenticated using (
    is_admin() or exists (select 1 from public.listings l where l.id = listing_id and l.landlord_id = auth.uid())
  ) with check (
    is_admin() or exists (select 1 from public.listings l where l.id = listing_id and l.landlord_id = auth.uid())
  );

-- =========================================================================
-- 3. applications
-- =========================================================================
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  renter_id uuid not null references public.profiles (id) on delete cascade,
  renter_name text,
  renter_email text,
  move_in_date text,
  note text,
  status text not null default 'submitted' check (status in ('submitted', 'approved', 'declined')),
  id_file_name text,
  created_at timestamptz not null default now()
);

alter table public.applications enable row level security;

drop policy if exists "applications_select" on public.applications;
create policy "applications_select" on public.applications
  for select to authenticated using (
    auth.uid() = renter_id
    or is_admin()
    or exists (select 1 from public.listings l where l.id = listing_id and l.landlord_id = auth.uid())
  );

drop policy if exists "applications_insert" on public.applications;
create policy "applications_insert" on public.applications
  for insert to authenticated with check (
    auth.uid() = renter_id
    and exists (select 1 from public.profiles where id = auth.uid() and status = 'active')
  );

drop policy if exists "applications_update" on public.applications;
create policy "applications_update" on public.applications
  for update to authenticated using (
    is_admin() or exists (select 1 from public.listings l where l.id = listing_id and l.landlord_id = auth.uid())
  );

-- =========================================================================
-- 4. verifications (Phase B)
-- =========================================================================
create table if not exists public.verifications (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  status text not null default 'none' check (status in ('none', 'pending', 'approved', 'rejected')),
  file_name text,
  submitted_at timestamptz
);

alter table public.verifications enable row level security;

drop policy if exists "verifications_select" on public.verifications;
create policy "verifications_select" on public.verifications
  for select to authenticated using (true);

drop policy if exists "verifications_write_own" on public.verifications;
create policy "verifications_write_own" on public.verifications
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "verifications_update" on public.verifications;
create policy "verifications_update" on public.verifications
  for update to authenticated using (auth.uid() = user_id or is_admin());

-- =========================================================================
-- 5. favorites (Phase B)
-- =========================================================================
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  renter_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (renter_id, listing_id)
);

alter table public.favorites enable row level security;

drop policy if exists "favorites_all_own" on public.favorites;
create policy "favorites_all_own" on public.favorites
  for all to authenticated using (auth.uid() = renter_id) with check (auth.uid() = renter_id);

drop policy if exists "favorites_admin_select" on public.favorites;
create policy "favorites_admin_select" on public.favorites
  for select using (is_admin());

-- =========================================================================
-- 6. reviews (Phase B)
-- =========================================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  from_id uuid references public.profiles (id) on delete set null,
  from_name text,
  from_role text,
  to_id uuid references public.profiles (id) on delete set null,
  to_name text,
  to_role text,
  rating int not null check (rating between 1 and 5),
  text text,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

drop policy if exists "reviews_select" on public.reviews;
create policy "reviews_select" on public.reviews for select using (true);

drop policy if exists "reviews_insert" on public.reviews;
create policy "reviews_insert" on public.reviews
  for insert to authenticated with check (auth.uid() = from_id);

-- =========================================================================
-- 7. sponsor_slots (Phase B — admin managed ads)
-- =========================================================================
create table if not exists public.sponsor_slots (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('carousel', 'top-section', 'listing')),
  label text not null,
  blurb text,
  active boolean not null default true,
  impressions int not null default 0,
  clicks int not null default 0,
  placements text[] not null default '{}',
  neighborhood_slugs text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.sponsor_slots enable row level security;

drop policy if exists "sponsor_slots_select" on public.sponsor_slots;
create policy "sponsor_slots_select" on public.sponsor_slots for select using (active);

drop policy if exists "sponsor_slots_admin_write" on public.sponsor_slots;
create policy "sponsor_slots_admin_write" on public.sponsor_slots
  for all to authenticated using (is_admin()) with check (is_admin());

-- =========================================================================
-- 8. reports (Phase B)
-- =========================================================================
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles (id) on delete set null,
  reported_by_name text,
  target_type text,
  target_id text,
  target_label text,
  reason text,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

drop policy if exists "reports_insert" on public.reports;
create policy "reports_insert" on public.reports
  for insert to authenticated with check (auth.uid() = reporter_id);

drop policy if exists "reports_admin_all" on public.reports;
create policy "reports_admin_all" on public.reports
  for all to authenticated using (is_admin()) with check (is_admin());

-- =========================================================================
-- 9. support_tickets (Phase B)
-- =========================================================================
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  from_name text,
  type text,
  subject text not null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  thread jsonb not null default '[]',
  created_at timestamptz not null default now()
);

alter table public.support_tickets enable row level security;

drop policy if exists "support_tickets_own_or_admin" on public.support_tickets;
create policy "support_tickets_own_or_admin" on public.support_tickets
  for select to authenticated using (auth.uid() = user_id or is_admin());

drop policy if exists "support_tickets_insert" on public.support_tickets;
create policy "support_tickets_insert" on public.support_tickets
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "support_tickets_update" on public.support_tickets;
create policy "support_tickets_update" on public.support_tickets
  for update to authenticated using (auth.uid() = user_id or is_admin());

-- =========================================================================
-- 10. notifications (Phase B)
-- =========================================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text,
  text text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

drop policy if exists "notifications_all_own" on public.notifications;
create policy "notifications_all_own" on public.notifications
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================================
-- 11. messaging (Phase B)
-- =========================================================================
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz,
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

drop policy if exists "conversations_participant" on public.conversations;
create policy "conversations_participant" on public.conversations
  for select to authenticated using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = id and cp.user_id = auth.uid()
    )
  );

drop policy if exists "conversations_insert" on public.conversations;
create policy "conversations_insert" on public.conversations
  for insert to authenticated with check (true);

drop policy if exists "conversation_participants_own" on public.conversation_participants;
create policy "conversation_participants_own" on public.conversation_participants
  for select to authenticated using (
    user_id = auth.uid()
    or exists (
      select 1 from public.conversation_participants cp2
      where cp2.conversation_id = conversation_id and cp2.user_id = auth.uid()
    )
  );

drop policy if exists "conversation_participants_insert_self" on public.conversation_participants;
create policy "conversation_participants_insert_self" on public.conversation_participants
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "conversation_participants_insert_other" on public.conversation_participants;
create policy "conversation_participants_insert_other" on public.conversation_participants
  for insert to authenticated with check (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversation_id and cp.user_id = auth.uid()
    )
  );

drop policy if exists "conversation_participants_update_own" on public.conversation_participants;
create policy "conversation_participants_update_own" on public.conversation_participants
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "messages_participant_select" on public.messages;
create policy "messages_participant_select" on public.messages
  for select to authenticated using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversation_id and cp.user_id = auth.uid()
    )
  );

drop policy if exists "messages_participant_insert" on public.messages;
create policy "messages_participant_insert" on public.messages
  for insert to authenticated with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversation_id and cp.user_id = auth.uid()
    )
  );

-- =========================================================================
-- 12. roomer_profiles + host_subscriptions + subscription_history (Phase B
--     — "Find a Roomer")
-- =========================================================================
create table if not exists public.roomer_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  age int,
  occupation text,
  bio text,
  budget_min numeric,
  budget_max numeric,
  move_in_date text,
  neighborhoods text[] not null default '{}',
  tags text[] not null default '{}',
  verified boolean not null default false
);

alter table public.roomer_profiles enable row level security;

drop policy if exists "roomer_profiles_select" on public.roomer_profiles;
create policy "roomer_profiles_select" on public.roomer_profiles for select to authenticated using (true);

drop policy if exists "roomer_profiles_write_own" on public.roomer_profiles;
create policy "roomer_profiles_write_own" on public.roomer_profiles
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.host_subscriptions (
  host_id uuid primary key references public.profiles (id) on delete cascade,
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'annual')),
  subscribed_at timestamptz not null default now()
);

alter table public.host_subscriptions enable row level security;

drop policy if exists "host_subscriptions_own_or_admin" on public.host_subscriptions;
create policy "host_subscriptions_own_or_admin" on public.host_subscriptions
  for select to authenticated using (auth.uid() = host_id or is_admin());

drop policy if exists "host_subscriptions_write_own" on public.host_subscriptions;
create policy "host_subscriptions_write_own" on public.host_subscriptions
  for all to authenticated using (auth.uid() = host_id) with check (auth.uid() = host_id);

create table if not exists public.subscription_history (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('subscribed', 'cancelled')),
  tier_label text,
  price numeric,
  billing_cycle text,
  at timestamptz not null default now()
);

alter table public.subscription_history enable row level security;

drop policy if exists "subscription_history_own_or_admin" on public.subscription_history;
create policy "subscription_history_own_or_admin" on public.subscription_history
  for select to authenticated using (auth.uid() = host_id or is_admin());

drop policy if exists "subscription_history_insert_own" on public.subscription_history;
create policy "subscription_history_insert_own" on public.subscription_history
  for insert to authenticated with check (auth.uid() = host_id);

-- =========================================================================
-- 13. Storage buckets
-- =========================================================================
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('id-uploads', 'id-uploads', false)
on conflict (id) do nothing;

drop policy if exists "listing_photos_bucket_read" on storage.objects;
create policy "listing_photos_bucket_read" on storage.objects
  for select using (bucket_id = 'listing-photos');

drop policy if exists "listing_photos_bucket_write" on storage.objects;
create policy "listing_photos_bucket_write" on storage.objects
  for insert to authenticated with check (bucket_id = 'listing-photos');

drop policy if exists "listing_photos_bucket_delete" on storage.objects;
create policy "listing_photos_bucket_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'listing-photos' and owner = auth.uid());

drop policy if exists "id_uploads_bucket_read" on storage.objects;
create policy "id_uploads_bucket_read" on storage.objects
  for select to authenticated using (bucket_id = 'id-uploads' and (owner = auth.uid() or is_admin()));

drop policy if exists "id_uploads_bucket_write" on storage.objects;
create policy "id_uploads_bucket_write" on storage.objects
  for insert to authenticated with check (bucket_id = 'id-uploads' and owner = auth.uid());

-- =========================================================================
-- 14. Ad stat counters (atomic, bypasses RLS via security definer so
--     anonymous visitors can register a view/click too)
-- =========================================================================
create or replace function public.increment_sponsor_impressions(p_slot_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.sponsor_slots set impressions = impressions + 1 where id = p_slot_id;
$$;

create or replace function public.increment_sponsor_clicks(p_slot_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.sponsor_slots set clicks = clicks + 1 where id = p_slot_id;
$$;

grant execute on function public.increment_sponsor_impressions(uuid) to anon, authenticated;
grant execute on function public.increment_sponsor_clicks(uuid) to anon, authenticated;
