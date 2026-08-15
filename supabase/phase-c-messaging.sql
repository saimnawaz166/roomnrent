-- RoomieRents — Phase C: real messaging + Find a Roomer
--
-- Run this ONCE in the Supabase SQL Editor, AFTER schema.sql and
-- phase-b-additions.sql. schema.sql only had SELECT policies for
-- conversations/conversation_participants — nothing could actually create a
-- conversation. Adds the missing INSERT policies. Idempotent — safe to re-run.

-- Anyone authenticated can start a conversation shell (they add themselves
-- as a participant in the very next call).
drop policy if exists "conversations_insert" on public.conversations;
create policy "conversations_insert" on public.conversations
  for insert to authenticated with check (true);

-- You can always add yourself to a conversation...
drop policy if exists "conversation_participants_insert_self" on public.conversation_participants;
create policy "conversation_participants_insert_self" on public.conversation_participants
  for insert to authenticated with check (user_id = auth.uid());

-- ...and once you're in it, you can add the other person (this is how
-- starting a new 1:1 conversation works: insert self, then insert them).
drop policy if exists "conversation_participants_insert_other" on public.conversation_participants;
create policy "conversation_participants_insert_other" on public.conversation_participants
  for insert to authenticated with check (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversation_id and cp.user_id = auth.uid()
    )
  );
