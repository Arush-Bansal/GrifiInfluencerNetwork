-- Create messages table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references auth.users(id) not null,
  receiver_id uuid references auth.users(id) not null,
  curr_user_id uuid references auth.users(id) default auth.uid(),
  content text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table public.messages enable row level security;

-- Policies
create policy "Users can view messages they sent or received"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can insert messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

-- Enable Realtime
alter publication supabase_realtime add table public.messages;
