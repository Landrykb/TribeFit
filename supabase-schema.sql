-- =====================================================================================
-- TribeFit Database Schema for Supabase
-- =====================================================================================
-- Run this SQL in your Supabase SQL Editor after creating your project
-- This will create all tables, RLS policies, storage buckets, and functions needed

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =====================================================================================
-- TABLES
-- =====================================================================================

-- Users table (extends Supabase auth.users)
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text not null,
  avatar_url text,
  locale text not null default 'en' check (locale in ('en', 'fr', 'ja')),
  height_cm int,
  weight_kg_hist jsonb default '[]'::jsonb,
  protein_goal_g int default 120,
  settings jsonb default '{"snitch":true,"privacy":"friends"}'::jsonb,
  wallet_balance_tc numeric(12,2) not null default 0 check (wallet_balance_tc >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Friends relationships
create table if not exists public.friends (
  user_id uuid references public.users(id) on delete cascade,
  friend_id uuid references public.users(id) on delete cascade,
  status text not null default 'accepted' check (status in ('pending', 'accepted', 'blocked')),
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  check (user_id != friend_id)
);

-- Tribes (workout groups)
create table if not exists public.tribes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  owner_id uuid references public.users(id) on delete set null,
  invite_code text unique not null default substr(md5(random()::text), 1, 8),
  settings jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Tribe memberships
create table if not exists public.tribe_members (
  tribe_id uuid references public.tribes(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'admin', 'moderator', 'owner')),
  status text default 'active' check (status in ('active', 'invited', 'left', 'banned')),
  joined_at timestamptz not null default now(),
  primary key (tribe_id, user_id)
);

-- Pact wallets (shared tribe funds)
create table if not exists public.pact_wallets (
  id uuid primary key default uuid_generate_v4(),
  tribe_id uuid unique references public.tribes(id) on delete cascade,
  balance_tc numeric(12,2) not null default 0 check (balance_tc >= 0),
  donation_pool_tc numeric(12,2) default 0 check (donation_pool_tc >= 0),
  goal_label text,
  goal_amount_tc numeric(12,2),
  rules jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Backfill / safety for existing deployments
ALTER TABLE public.pact_wallets
  ADD COLUMN IF NOT EXISTS donation_pool_tc numeric(12,2) default 0 check (donation_pool_tc >= 0);

-- Pact wallet transactions
create table if not exists public.pact_tx (
  id uuid primary key default uuid_generate_v4(),
  wallet_id uuid references public.pact_wallets(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  type text not null check (type in ('skip', 'topup', 'spend', 'donate', 'reward')),
  amount_tc numeric(12,2) not null,
  description text,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Exercise database
create table if not exists public.exercises (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text,
  equipment text,
  muscles text[],
  cues text[],
  video_url text,
  difficulty_level int default 1 check (difficulty_level between 1 and 5),
  created_at timestamptz not null default now()
);

-- Workout programs
create table if not exists public.programs (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.users(id) on delete cascade,
  title text not null,
  description text,
  days jsonb not null,
  difficulty_level int default 1 check (difficulty_level between 1 and 5),
  public boolean default false,
  created_at timestamptz not null default now()
);

-- Workout sessions
create table if not exists public.sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  tribe_id uuid references public.tribes(id) on delete set null,
  program_id uuid references public.programs(id) on delete set null,
  date date not null,
  duration_s int,
  kcal int,
  hr_avg int,
  ai_metrics jsonb default '{}'::jsonb,
  notes text,
  completed boolean default false,
  created_at timestamptz not null default now()
);

-- Exercise sets within sessions
create table if not exists public.sets (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references public.sessions(id) on delete cascade,
  exercise_id uuid references public.exercises(id) on delete set null,
  set_number int not null,
  load_kg numeric(8,2),
  reps_target int,
  reps_done int,
  rpe numeric(3,1) check (rpe between 1 and 10),
  rest_s int,
  video_ref text,
  ai_rep_count int,
  ai_form_score numeric(3,1),
  created_at timestamptz not null default now()
);

-- Social posts
create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  tribe_id uuid references public.tribes(id) on delete set null,
  session_id uuid references public.sessions(id) on delete set null,
  media_url text,
  media_type text check (media_type in ('image', 'video')),
  caption text,
  likes_count int default 0,
  comments_count int default 0,
  created_at timestamptz not null default now()
);

-- Comments on posts
create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

-- Post likes
create table if not exists public.post_likes (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  type text not null check (type in ('snitch', 'reminder', 'coach', 'system', 'social')),
  title text not null,
  body text not null,
  payload jsonb default '{}'::jsonb,
  read boolean default false,
  created_at timestamptz not null default now()
);

-- Payment records
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  type text not null check (type in ('topup', 'coach', 'pact', 'tip', 'skip', 'refund')),
  amount_tc numeric(12,2) not null,
  amount_cents int not null, -- Original payment amount in cents
  currency text not null default 'USD',
  stripe_payment_intent_id text,
  stripe_charge_id text,
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Tips between users
create table if not exists public.tips (
  id uuid primary key default uuid_generate_v4(),
  from_user_id uuid references public.users(id) on delete set null,
  to_user_id uuid references public.users(id) on delete set null,
  post_id uuid references public.posts(id) on delete set null,
  amount_tc numeric(12,2) not null check (amount_tc > 0),
  message text,
  created_at timestamptz not null default now()
);

-- Coach eligibility scores
create table if not exists public.coach_eligibility (
  user_id uuid references public.users(id) on delete cascade,
  week_of date not null,
  score numeric(5,2) not null check (score between 0 and 100),
  components jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, week_of)
);

-- Coach applications
create table if not exists public.coach_applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'under_review')),
  eligibility_score numeric(5,2),
  kyc_status text default 'unverified' check (kyc_status in ('unverified', 'pending', 'verified', 'failed')),
  quiz_score numeric(5,2),
  quiz_answers jsonb,
  practical_scores jsonb default '[]'::jsonb,
  reviewer_id uuid references public.users(id) on delete set null,
  review_notes text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- Coach profiles
create table if not exists public.coach_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  tier text not null default 'candidate' check (tier in ('candidate', 'certified', 'pro')),
  bio text,
  specialties text[],
  languages text[] default '{en}'::text[],
  pricing jsonb default '{}'::jsonb,
  rating_avg numeric(3,2) check (rating_avg between 0 and 5),
  rating_count int default 0,
  refund_rate numeric(5,2) default 0 check (refund_rate between 0 and 100),
  total_clients int default 0,
  active_clients int default 0,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Coach service offerings
create table if not exists public.coach_offerings (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid references public.users(id) on delete cascade,
  type text not null check (type in ('1on1', 'cohort', 'plan', 'formpack', 'consultation')),
  title text not null,
  description text,
  price_tc numeric(12,2) not null check (price_tc > 0),
  duration_weeks int,
  max_clients int,
  assets jsonb default '[]'::jsonb,
  active boolean default true,
  created_at timestamptz not null default now()
);

-- Coach-client relationships
create table if not exists public.coach_clients (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid references public.users(id) on delete cascade,
  client_id uuid references public.users(id) on delete cascade,
  offering_id uuid references public.coach_offerings(id) on delete set null,
  start_date date not null,
  end_date date,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled', 'paused')),
  plan_ref uuid references public.programs(id) on delete set null,
  checkin_cadence text default 'weekly',
  payment_id uuid references public.payments(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Webhook events (for idempotency)
create table if not exists public.webhook_events (
  id text primary key, -- Stripe event ID or custom UUID
  type text not null,
  payload jsonb not null,
  processed_at timestamptz not null default now(),
  source text not null default 'stripe'
);

-- Add these new tables after the main schema

-- Tribe invite codes (separate from main tribes table for tracking)
create table if not exists public.tribe_invite_codes (
  id uuid primary key default uuid_generate_v4(),
  tribe_id uuid references public.tribes(id) on delete cascade,
  code text unique not null default substr(md5(random()::text), 1, 8),
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Coach ratings and hires
create table if not exists public.coach_hires (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid references public.users(id) on delete cascade,
  client_id uuid references public.users(id) on delete cascade,
  offering_id uuid references public.coach_offerings(id) on delete set null,
  price_tc numeric(12,2) not null,
  status text not null default 'active' check (status in ('active', 'completed', 'refunded', 'cancelled')),
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create table if not exists public.coach_ratings (
  id uuid primary key default uuid_generate_v4(),
  hire_id uuid references public.coach_hires(id) on delete cascade,
  coach_id uuid references public.users(id) on delete cascade,
  client_id uuid references public.users(id) on delete cascade,
  stars int check (stars between 1 and 5),
  text text,
  created_at timestamptz not null default now(),
  unique (hire_id, client_id)
);

-- Equipment catalog
create table if not exists public.catalog_items (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  category text not null check (category in ('strength', 'cardio', 'recovery', 'accessories', 'nutrition')),
  icon text not null, -- lucide icon name
  specs jsonb default '{}',
  vendor_name text,
  price_tc numeric(12,2),
  active boolean default true,
  created_at timestamptz not null default now()
);

-- Pact spend requests (updated)
create table if not exists public.pact_spend_requests (
  id uuid primary key default uuid_generate_v4(),
  wallet_id uuid references public.pact_wallets(id) on delete cascade,
  type text not null check (type in ('gear', 'donation')),
  label text not null,
  item_id uuid references public.catalog_items(id) on delete set null,
  amount_tc numeric(12,2) not null check (amount_tc > 0),
  status text not null default 'requested' check (status in ('requested', 'approved', 'rejected')),
  vendor_ref text,
  gym_name text,
  created_by uuid references public.users(id) on delete set null,
  approved_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

-- Wishlists (group equipment goals)
create table if not exists public.wishlists (
  id uuid primary key default uuid_generate_v4(),
  tribe_id uuid unique references public.tribes(id) on delete cascade,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wishlist_items (
  id uuid primary key default uuid_generate_v4(),
  wishlist_id uuid references public.wishlists(id) on delete cascade,
  catalog_item_id uuid references public.catalog_items(id) on delete set null,
  label text not null,
  specs jsonb default '{}'::jsonb,
  target_tc numeric(12,2) not null check (target_tc > 0),
  pledged_tc numeric(12,2) not null default 0 check (pledged_tc >= 0),
  status text not null default 'planned' check (status in ('planned', 'funded', 'purchased', 'cancelled')),
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Equipment catalog (also expose a `name` alias for client code that expects `name` instead of `title`)
ALTER TABLE public.catalog_items
  ADD COLUMN IF NOT EXISTS name text GENERATED ALWAYS AS (title) STORED;

-- Gyms directory
create table if not exists public.gyms (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  stripe_connect_id text,
  country text default 'US',
  city text,
  address text,
  created_at timestamptz not null default now()
);

-- Legacy/ephemeral app state (used for features not yet migrated to normalized tables)
-- This single-row JSON blob is loaded at the start of each API request and saved
-- at the end. It lets file-store-backed endpoints persist on Vercel until they are
-- migrated to proper Supabase tables.
create table if not exists public.app_state (
  id integer primary key default 1 check (id = 1),
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- =====================================================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================================================

-- Users: can read/update own profile
alter table public.users enable row level security;

create policy "Users can read own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Tribes: members can read their tribes
alter table public.tribes enable row level security;

create policy "Members can read their tribes" on public.tribes
  for select using (
    exists (
      select 1 from public.tribe_members 
      where tribe_id = id and user_id = auth.uid()
    )
  );

create policy "Users can create tribes" on public.tribes
  for insert with check (auth.uid() = owner_id);

-- Tribe members: can read tribe memberships
alter table public.tribe_members enable row level security;

create policy "Members can read tribe memberships" on public.tribe_members
  for select using (
    exists (
      select 1 from public.tribe_members tm
      where tm.user_id = auth.uid() and tm.tribe_id = tribe_members.tribe_id
    )
  );

-- Pact wallets: tribe members can read
alter table public.pact_wallets enable row level security;

create policy "Tribe members can read pact wallet" on public.pact_wallets
  for select using (
    exists (
      select 1 from public.tribe_members tm
      where tm.user_id = auth.uid() and tm.tribe_id = pact_wallets.tribe_id
    )
  );

-- Pact transactions: tribe members can read
alter table public.pact_tx enable row level security;

create policy "Tribe members can read pact transactions" on public.pact_tx
  for select using (
    exists (
      select 1 from public.pact_wallets w
      join public.tribe_members tm on tm.tribe_id = w.tribe_id
      where w.id = pact_tx.wallet_id and tm.user_id = auth.uid()
    )
  );

-- Sessions: users can read/write own sessions, tribe members can read
alter table public.sessions enable row level security;

create policy "Users can manage own sessions" on public.sessions
  for all using (auth.uid() = user_id);

create policy "Tribe members can read tribe sessions" on public.sessions
  for select using (
    tribe_id is not null and exists (
      select 1 from public.tribe_members tm
      where tm.tribe_id = sessions.tribe_id and tm.user_id = auth.uid()
    )
  );

-- Sets: users can manage own sets
alter table public.sets enable row level security;

create policy "Users can manage own sets" on public.sets
  for all using (
    exists (
      select 1 from public.sessions s
      where s.id = sets.session_id and s.user_id = auth.uid()
    )
  );

-- Posts: users can create own posts, tribe members can read tribe posts
alter table public.posts enable row level security;

create policy "Users can create own posts" on public.posts
  for insert with check (auth.uid() = user_id);

create policy "Users can update own posts" on public.posts
  for update using (auth.uid() = user_id);

create policy "Users can read public and tribe posts" on public.posts
  for select using (
    tribe_id is null or exists (
      select 1 from public.tribe_members tm
      where tm.tribe_id = posts.tribe_id and tm.user_id = auth.uid()
    )
  );

-- Comments: users can create own comments, read tribe comments
alter table public.comments enable row level security;

create policy "Users can create own comments" on public.comments
  for insert with check (auth.uid() = user_id);

create policy "Users can read tribe comments" on public.comments
  for select using (
    exists (
      select 1 from public.posts p
      join public.tribe_members tm on (tm.tribe_id = p.tribe_id or p.tribe_id is null)
      where p.id = comments.post_id and tm.user_id = auth.uid()
    )
  );

-- Notifications: users can read own notifications
alter table public.notifications enable row level security;

create policy "Users can read own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- Payments: users can read own payments
alter table public.payments enable row level security;

create policy "Users can read own payments" on public.payments
  for select using (auth.uid() = user_id);

-- Coach profiles: public read, own write
alter table public.coach_profiles enable row level security;

create policy "Public can read coach profiles" on public.coach_profiles
  for select using (true);

create policy "Coaches can update own profile" on public.coach_profiles
  for update using (auth.uid() = user_id);
-- Add RLS policies for new tables
alter table public.tribe_invite_codes enable row level security;
create policy "Tribe members can read invite codes" on public.tribe_invite_codes
  for select using (
    exists (
      select 1 from public.tribe_members tm
      where tm.tribe_id = tribe_invite_codes.tribe_id and tm.user_id = auth.uid()
    )
  );

alter table public.pact_spend_requests enable row level security;
create policy "Tribe members can read spend requests" on public.pact_spend_requests
  for select using (
    exists (
      select 1 from public.pact_wallets pw
      join public.tribe_members tm on tm.tribe_id = pw.tribe_id
      where pw.id = pact_spend_requests.wallet_id and tm.user_id = auth.uid()
    )
  );

alter table public.gyms enable row level security;
create policy "Public can read gyms" on public.gyms
  for select using (true);

-- =====================================================================================
-- STORAGE BUCKETS
-- =====================================================================================

-- Posts bucket (for social media uploads)
insert into storage.buckets (id, name, public) 
values ('posts', 'posts', true)
on conflict (id) do nothing;

-- Sets bucket (for workout videos, form checks)
insert into storage.buckets (id, name, public) 
values ('sets', 'sets', false)
on conflict (id) do nothing;

-- Profile avatars bucket
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage policies for posts bucket
create policy "Users can upload to posts bucket" on storage.objects
  for insert with check (
    bucket_id = 'posts' and 
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Public can view posts" on storage.objects
  for select using (bucket_id = 'posts');

-- Storage policies for sets bucket (private)
create policy "Users can upload to sets bucket" on storage.objects
  for insert with check (
    bucket_id = 'sets' and 
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own sets" on storage.objects
  for select using (
    bucket_id = 'sets' and 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for avatars bucket
create policy "Users can upload own avatar" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and 
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Public can view avatars" on storage.objects
  for select using (bucket_id = 'avatars');

-- =====================================================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================================================

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_users_updated_at before update on public.users
  for each row execute function public.update_updated_at_column();

create trigger update_pact_wallets_updated_at before update on public.pact_wallets
  for each row execute function public.update_updated_at_column();

create trigger update_coach_profiles_updated_at before update on public.coach_profiles
  for each row execute function public.update_updated_at_column();

-- Function to automatically create pact wallet when tribe is created
create or replace function public.create_pact_wallet_for_tribe()
returns trigger as $$
begin
  insert into public.pact_wallets (tribe_id, goal_label)
  values (new.id, 'Equipment Fund');
  return new;
end;
$$ language plpgsql;

create trigger create_pact_wallet_trigger after insert on public.tribes
  for each row execute function public.create_pact_wallet_for_tribe();

-- Function to update post counts
create or replace function public.update_post_counts()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.posts 
    set comments_count = comments_count + 1
    where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.posts 
    set comments_count = comments_count - 1
    where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger update_comments_count after insert or delete on public.comments
  for each row execute function public.update_post_counts();

-- Function to update like counts
create or replace function public.update_like_counts()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.posts 
    set likes_count = likes_count + 1
    where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.posts 
    set likes_count = likes_count - 1
    where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger update_likes_count after insert or delete on public.post_likes
  for each row execute function public.update_like_counts();

-- =====================================================================================
-- SEED DATA (Optional - for testing)
-- =====================================================================================

-- Insert some basic exercises
insert into public.exercises (id, name, category, equipment, muscles, cues, difficulty_level) values
  ('550e8400-e29b-41d4-a716-446655440001', 'Push-up', 'bodyweight', 'none', array['chest', 'triceps', 'shoulders'], array['Keep core tight', 'Full range of motion'], 2),
  ('550e8400-e29b-41d4-a716-446655440002', 'Squat', 'bodyweight', 'none', array['quads', 'glutes', 'hamstrings'], array['Chest up', 'Knees track over toes'], 2),
  ('550e8400-e29b-41d4-a716-446655440003', 'Plank', 'bodyweight', 'none', array['core', 'shoulders'], array['Straight line from head to toe'], 1),
  ('550e8400-e29b-41d4-a716-446655440004', 'Burpee', 'bodyweight', 'none', array['full body'], array['Land softly', 'Full hip extension on jump'], 4)
on conflict (id) do nothing;

-- Success message
select 'TribeFit database schema created successfully! 🎉' as message;