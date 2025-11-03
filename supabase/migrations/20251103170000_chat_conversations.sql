-- Conversations for ride-specific 1:1 chat
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists public.conversation_participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz,
  unique (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (length(trim(content)) > 0),
  created_at timestamptz default now()
);

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

-- Policies: only participants can see/insert messages/conversation
create policy "Participants can select their conversations"
  on public.conversations
  for select
  using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = id and cp.user_id = auth.uid()
    )
  );

create policy "Participants can select their participants"
  on public.conversation_participants
  for select
  using (user_id = auth.uid() or exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = conversation_id and cp.user_id = auth.uid()
  ));

create policy "Participants can update own last_read"
  on public.conversation_participants
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Participants can select messages"
  on public.messages
  for select
  using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid()
    )
  );

create policy "Participants can insert messages"
  on public.messages
  for insert
  with check (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversation_id and cp.user_id = auth.uid()
    ) and sender_id = auth.uid()
  );

-- Helper: get or create a 1:1 conversation for a ride & two users
create or replace function public.get_or_create_conversation(p_ride_id uuid, p_user_a uuid, p_user_b uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid;
begin
  -- try find existing conversation with exactly these two participants and ride
  select c.id into v_conversation_id
  from conversations c
  join conversation_participants p1 on p1.conversation_id = c.id and p1.user_id = p_user_a
  join conversation_participants p2 on p2.conversation_id = c.id and p2.user_id = p_user_b
  where c.ride_id = p_ride_id
  limit 1;

  if v_conversation_id is not null then
    return v_conversation_id;
  end if;

  -- create new
  insert into conversations (ride_id) values (p_ride_id) returning id into v_conversation_id;
  insert into conversation_participants (conversation_id, user_id) values
    (v_conversation_id, p_user_a),
    (v_conversation_id, p_user_b);

  return v_conversation_id;
end;
$$;

-- Notify the other participant upon new message
create or replace function public.handle_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_other_user uuid;
  v_ride_id uuid;
begin
  select ride_id into v_ride_id from conversations where id = new.conversation_id;
  select user_id into v_other_user
  from conversation_participants
  where conversation_id = new.conversation_id and user_id <> new.sender_id
  limit 1;

  if v_other_user is not null then
    perform send_ride_notification(
      v_other_user,
      v_ride_id,
      null,
      'chat_message',
      'New message',
      'You have a new chat message'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_handle_new_message on public.messages;
create trigger trg_handle_new_message
after insert on public.messages
for each row execute function public.handle_new_message();

-- enable realtime on messages
alter publication supabase_realtime add table public.messages;

