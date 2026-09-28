-- Run this entire file in your Supabase project's SQL editor
-- Dashboard > SQL Editor > New query > paste and run

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Listings table
create table public.listings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  category text not null,
  location text not null,
  price numeric not null,
  description text default '',
  availability text default '',
  photo_url text default '',
  owner_name text not null,
  owner_email text not null,
  owner_phone text default '',
  emoji text default '🏖️',
  is_approved boolean default true,
  is_active boolean default true,
  rating numeric default 5.0,
  reviews_count integer default 0,
  rules text[] default '{}',
  created_at timestamptz default now()
);

-- Bookings table
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  renter_name text not null,
  renter_email text not null,
  renter_phone text default '',
  start_date date,
  end_date date,
  days integer default 1,
  total_price numeric not null,
  stripe_session_id text default '',
  status text default 'pending_payment',
  message text default '',
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.listings enable row level security;
alter table public.bookings enable row level security;

-- Listings: anyone can read approved+active listings
create policy "Public can view approved active listings"
  on public.listings for select
  using (is_approved = true and is_active = true);

-- Listings: owners can always see their own (including pending)
create policy "Owners can view their own listings"
  on public.listings for select
  using (auth.uid() = user_id);

-- Listings: authenticated users can insert (user_id must match)
create policy "Authenticated users can insert listings"
  on public.listings for insert
  with check (auth.uid() = user_id);

-- Listings: owners can update their own
create policy "Owners can update their own listings"
  on public.listings for update
  using (auth.uid() = user_id);

-- Listings: owners can delete their own
create policy "Owners can delete their own listings"
  on public.listings for delete
  using (auth.uid() = user_id);

-- Bookings: anyone can create (renters don't need accounts)
create policy "Anyone can create bookings"
  on public.bookings for insert
  with check (true);

-- Bookings: listing owners can read bookings for their listings
create policy "Owners can view bookings for their listings"
  on public.bookings for select
  using (
    exists (
      select 1 from public.listings
      where listings.id = bookings.listing_id
      and listings.user_id = auth.uid()
    )
  );
