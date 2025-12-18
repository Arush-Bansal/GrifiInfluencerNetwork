-- Communities table
create table if not exists public.communities (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  description text,
  image_url text,
  created_by uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Community Roles Enum
do $$ begin
  create type community_role as enum ('admin', 'moderator', 'member');
exception
  when duplicate_object then null;
end $$;

-- Community Memberships
create table if not exists public.community_members (
  community_id uuid references public.communities(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role community_role default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (community_id, user_id)
);

-- Community Followers
create table if not exists public.community_followers (
  community_id uuid references public.communities(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  followed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (community_id, user_id)
);

-- Community Posts Status Enum
do $$ begin
  create type post_status as enum ('pending', 'approved', 'rejected');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.community_posts (
  id uuid default gen_random_uuid() primary key,
  community_id uuid references public.communities(id) on delete cascade,
  author_id uuid references auth.users(id) not null,
  content text not null,
  image_url text,
  status post_status default 'pending',
  moderated_by uuid references auth.users(id),
  moderated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Helper functions for RLS to avoid recursion (Security Definer bypasses RLS)
create or replace function public.is_admin(cid uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.community_members 
    where community_id = cid and user_id = auth.uid() and role = 'admin'
  ) or exists (
    select 1 from public.communities
    where id = cid and created_by = auth.uid()
  );
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.is_mod(cid uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.community_members 
    where community_id = cid and user_id = auth.uid() and role in ('admin', 'moderator')
  ) or exists (
    select 1 from public.communities
    where id = cid and created_by = auth.uid()
  );
end;
$$ language plpgsql security definer set search_path = public;

-- Enable RLS
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.community_followers enable row level security;
alter table public.community_posts enable row level security;

-- Policies for communities
create policy "communities_select" on public.communities for select using (true);
create policy "communities_insert" on public.communities for insert with check (auth.uid() is not null);
create policy "communities_update" on public.communities for update using (is_admin(id));

-- Policies for members
create policy "members_select" on public.community_members for select using (true);
create policy "members_insert" on public.community_members for insert with check (auth.uid() = user_id);
create policy "members_update" on public.community_members for update using (is_admin(community_id));
create policy "members_delete" on public.community_members for delete using (auth.uid() = user_id or is_admin(community_id));

-- Policies for followers
create policy "followers_select" on public.community_followers for select using (true);
create policy "followers_all" on public.community_followers for all using (auth.uid() = user_id);

-- Policies for posts
create policy "posts_select_approved" on public.community_posts for select 
using (status = 'approved' or auth.uid() = author_id or is_mod(community_id));

create policy "posts_insert" on public.community_posts for insert 
with check (exists (select 1 from community_members where community_id = community_posts.community_id and user_id = auth.uid()));

create policy "posts_update_mod" on public.community_posts for update 
using (is_mod(community_id));

-- Enable Realtime
alter publication supabase_realtime add table public.community_posts;
alter publication supabase_realtime add table public.community_members;
