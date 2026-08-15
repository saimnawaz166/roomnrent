-- RoomieRents — Phase D: unread messages, ad stat tracking
--
-- Run this ONCE in the Supabase SQL Editor, after schema.sql,
-- phase-b-additions.sql, and phase-c-messaging.sql. Idempotent — safe to
-- re-run.

-- Tracks when a user last opened a conversation, so unread counts can be
-- computed as "messages after my last_read_at, not sent by me".
alter table public.conversation_participants add column if not exists last_read_at timestamptz;

drop policy if exists "conversation_participants_update_own" on public.conversation_participants;
create policy "conversation_participants_update_own" on public.conversation_participants
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Atomic +1 counters for sponsor ad impressions/clicks — a plain client-side
-- read-then-write would race under concurrent viewers; these run entirely
-- in Postgres instead. security definer so anonymous visitors (who can't
-- otherwise write to sponsor_slots at all) can still register a view/click.
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

-- Admin "ban" is a soft-ban (profiles.status = 'suspended') — there's no
-- server-side admin API reachable from a publishable-key client to force a
-- real session logout. What we CAN enforce via RLS: a suspended account
-- can't create new listings or applications.
drop policy if exists "listings_insert" on public.listings;
create policy "listings_insert" on public.listings
  for insert to authenticated with check (
    auth.uid() = landlord_id
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('landlord', 'admin') and status = 'active'
    )
  );

drop policy if exists "applications_insert" on public.applications;
create policy "applications_insert" on public.applications
  for insert to authenticated with check (
    auth.uid() = renter_id
    and exists (select 1 from public.profiles where id = auth.uid() and status = 'active')
  );
