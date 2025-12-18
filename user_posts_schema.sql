-- User Posts table
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User Follows table
create table if not exists public.follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references auth.users(id) on delete cascade not null,
  following_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(follower_id, following_id)
);

-- Enable RLS
alter table public.posts enable row level security;
alter table public.follows enable row level security;

-- Policies for posts
-- Users can see posts of people they follow or their connections
create policy "Users can view posts from followed users"
  on public.posts for select
  using (
    auth.uid() = author_id or 
    exists (
      select 1 from public.follows 
      where follower_id = auth.uid() and following_id = posts.author_id
    ) or
    exists (
      select 1 from public.collab_requests
      where status = 'accepted' and (
        (sender_id = auth.uid() and receiver_id = posts.author_id) or
        (receiver_id = auth.uid() and sender_id = posts.author_id)
      )
    )
  );

create policy "Users can insert their own posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "Users can update their own posts"
  on public.posts for update
  using (auth.uid() = author_id);

create policy "Users can delete their own posts"
  on public.posts for delete
  using (auth.uid() = author_id);

-- Policies for follows
create policy "Everyone can view follows"
  on public.follows for select
  using (true);

create policy "Users can manage their own follows"
  on public.follows for all
  using (auth.uid() = follower_id);

-- Realtime
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.follows;
