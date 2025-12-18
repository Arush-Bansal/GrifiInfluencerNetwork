-- Create a table for brand campaigns
create table public.campaigns (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references auth.users(id) not null,
  title text not null,
  description text not null,
  status text default 'open', -- 'open', 'closed'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for campaign applications
create table public.campaign_applications (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  influencer_id uuid references auth.users(id) not null,
  status text default 'pending', -- 'pending', 'approved', 'rejected'
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(campaign_id, influencer_id)
);

-- Turn on RLS
alter table public.campaigns enable row level security;
alter table public.campaign_applications enable row level security;

-- Policies for campaigns
create policy "Anyone can view open campaigns"
  on public.campaigns for select
  using (status = 'open' or auth.uid() = brand_id);

create policy "Brands can insert their own campaigns"
  on public.campaigns for insert
  with check (auth.uid() = brand_id);

create policy "Brands can update their own campaigns"
  on public.campaigns for update
  using (auth.uid() = brand_id);

-- Policies for campaign applications
create policy "Influencers can view their own applications"
  on public.campaign_applications for select
  using (auth.uid() = influencer_id);

create policy "Brands can view applications for their campaigns"
  on public.campaign_applications for select
  using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = campaign_applications.campaign_id
      and campaigns.brand_id = auth.uid()
    )
  );

create policy "Influencers can insert their own applications"
  on public.campaign_applications for insert
  with check (auth.uid() = influencer_id);

create policy "Brands can update application status"
  on public.campaign_applications for update
  using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = campaign_applications.campaign_id
      and campaigns.brand_id = auth.uid()
    )
  );

-- Enable Realtime
alter publication supabase_realtime add table public.campaigns;
alter publication supabase_realtime add table public.campaign_applications;
