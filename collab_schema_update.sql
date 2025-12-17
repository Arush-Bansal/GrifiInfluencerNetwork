-- Create a table for collaboration and sponsorship requests
create type request_status as enum ('pending', 'accepted', 'rejected', 'completed');
create type request_type as enum ('collab', 'sponsorship');

create table public.collab_requests (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references auth.users(id) not null,
  receiver_id uuid references auth.users(id) not null,
  status request_status default 'pending',
  type request_type not null,
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table public.collab_requests enable row level security;

-- Policies
create policy "Users can view requests they sent or received"
  on public.collab_requests for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can insert requests"
  on public.collab_requests for insert
  with check (auth.uid() = sender_id);

create policy "Users can update requests they received (accept/reject)"
  on public.collab_requests for update
  using (auth.uid() = receiver_id);

-- Optional: Add real-time if needed
alter publication supabase_realtime add table public.collab_requests;
