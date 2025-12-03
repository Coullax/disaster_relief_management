-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid default uuid_generate_v4() primary key, -- decoupled from auth.users
  full_name text,
  email text unique, -- added for contact matching
  phone text, -- added for contact matching
  avatar_url text,
  bio text,
  location text,
  social_links jsonb default '{}'::jsonb,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Listings table
create table public.listings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade, -- nullable for anonymous listings
  title text not null,
  description text not null,
  type text not null check (type in ('need', 'offer')),
  category text not null,
  location text not null,
  latitude float,
  longitude float,
  media_urls text[] default array[]::text[],
  status text default 'active' check (status in ('active', 'closed', 'pending')),
  contact_email text,
  contact_phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tickets table (help requests/offers on listings)
create table public.tickets (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null, -- can be null for anon
  message text not null,
  contact_info text,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Activity Logs
create table public.activity_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  action text not null,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies

-- Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( true ); -- Allow anyone (server action handles logic)

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id ); -- Only if they are actually logged in and mapped

-- Listings
alter table public.listings enable row level security;

create policy "Listings are viewable by everyone."
  on public.listings for select
  using ( true );

create policy "Anyone can create listings."
  on public.listings for insert
  with check ( true );

create policy "Users can update own listings."
  on public.listings for update
  using ( auth.uid() = user_id );

create policy "Users can delete own listings."
  on public.listings for delete
  using ( auth.uid() = user_id );

-- Tickets
alter table public.tickets enable row level security;

create policy "Listing owners can view tickets for their listings."
  on public.tickets for select
  using ( auth.uid() in ( select user_id from public.listings where id = listing_id ) );

create policy "Users can view tickets they created."
  on public.tickets for select
  using ( auth.uid() = user_id );

create policy "Authenticated users can create tickets."
  on public.tickets for insert
  with check ( auth.role() = 'authenticated' ); -- Or allow anon? Prompt says "Automatically create user...". So maybe anon allowed?
  -- For now, assume auth required (auto-created user).

-- Storage Buckets (if using Supabase Storage)
-- insert into storage.buckets (id, name) values ('media', 'media');
-- create policy "Media is public" on storage.objects for select using ( bucket_id = 'media' );
-- create policy "Users can upload media" on storage.objects for insert with check ( bucket_id = 'media' and auth.role() = 'authenticated' );

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
