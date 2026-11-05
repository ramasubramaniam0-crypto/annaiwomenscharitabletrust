-- Annai Women's Charitable Trust — Supabase schema
-- Run in Supabase Dashboard > SQL Editor. This schema is designed for the browser anon key + RLS.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  email text,
  role text not null default 'member' check (role in ('member','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.donation_pledges (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  amount text not null,
  purpose text,
  status text not null default 'new' check (status in ('new','reviewing','contacted','approved','completed','closed')),
  created_at timestamptz not null default now()
);
create table if not exists public.volunteer_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  age integer,
  phone text not null,
  email text,
  interest text,
  message text,
  status text not null default 'new' check (status in ('new','reviewing','contacted','approved','completed','closed')),
  created_at timestamptz not null default now()
);
create table if not exists public.scholarship_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  course text not null,
  support_type text,
  message text,
  status text not null default 'new' check (status in ('new','reviewing','contacted','approved','completed','closed')),
  created_at timestamptz not null default now()
);
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  topic text,
  message text not null,
  status text not null default 'new' check (status in ('new','reviewing','contacted','approved','completed','closed')),
  created_at timestamptz not null default now()
);
create table if not exists public.event_interests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  event_name text not null,
  message text,
  status text not null default 'new' check (status in ('new','reviewing','contacted','approved','completed','closed')),
  created_at timestamptz not null default now()
);
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date,
  venue text,
  description text,
  image_url text,
  is_published boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  campaign_type text not null default 'Campaign',
  description text,
  media_url text,
  is_published boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.donation_pledges enable row level security;
alter table public.volunteer_applications enable row level security;
alter table public.scholarship_requests enable row level security;
alter table public.contact_messages enable row level security;
alter table public.event_interests enable row level security;
alter table public.events enable row level security;
alter table public.campaigns enable row level security;

-- Helper function avoids policy recursion when checking admin role.
create or replace function public.is_trust_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;
revoke all on function public.is_trust_admin() from public;
grant execute on function public.is_trust_admin() to anon, authenticated;

-- Profiles: users can read/update their own record, admins can read/manage all.
drop policy if exists "profile read own or admin" on public.profiles;
create policy "profile read own or admin" on public.profiles for select to authenticated
using (id = auth.uid() or public.is_trust_admin());
drop policy if exists "profile insert own member" on public.profiles;
create policy "profile insert own member" on public.profiles for insert to authenticated
with check (id = auth.uid() and role = 'member');
drop policy if exists "profile update own member" on public.profiles;
create policy "profile update own member" on public.profiles for update to authenticated
using ((id = auth.uid() and role = 'member') or public.is_trust_admin())
with check ((id = auth.uid() and role = 'member') or public.is_trust_admin());
drop policy if exists "profile admin delete" on public.profiles;
create policy "profile admin delete" on public.profiles for delete to authenticated
using (public.is_trust_admin());

-- Public forms accept submissions, but visitors cannot read any submission.
drop policy if exists "public submit donation pledge" on public.donation_pledges;
create policy "public submit donation pledge" on public.donation_pledges for insert to anon, authenticated
with check (status = 'new');
drop policy if exists "admin read donation pledges" on public.donation_pledges;
create policy "admin read donation pledges" on public.donation_pledges for select to authenticated using (public.is_trust_admin());
drop policy if exists "admin update donation pledges" on public.donation_pledges;
create policy "admin update donation pledges" on public.donation_pledges for update to authenticated using (public.is_trust_admin()) with check (public.is_trust_admin());
drop policy if exists "admin delete donation pledges" on public.donation_pledges;
create policy "admin delete donation pledges" on public.donation_pledges for delete to authenticated using (public.is_trust_admin());

drop policy if exists "public submit volunteer application" on public.volunteer_applications;
create policy "public submit volunteer application" on public.volunteer_applications for insert to anon, authenticated with check (status = 'new');
drop policy if exists "admin read volunteer applications" on public.volunteer_applications;
create policy "admin read volunteer applications" on public.volunteer_applications for select to authenticated using (public.is_trust_admin());
drop policy if exists "admin update volunteer applications" on public.volunteer_applications;
create policy "admin update volunteer applications" on public.volunteer_applications for update to authenticated using (public.is_trust_admin()) with check (public.is_trust_admin());
drop policy if exists "admin delete volunteer applications" on public.volunteer_applications;
create policy "admin delete volunteer applications" on public.volunteer_applications for delete to authenticated using (public.is_trust_admin());

drop policy if exists "public submit scholarship request" on public.scholarship_requests;
create policy "public submit scholarship request" on public.scholarship_requests for insert to anon, authenticated with check (status = 'new');
drop policy if exists "admin read scholarship requests" on public.scholarship_requests;
create policy "admin read scholarship requests" on public.scholarship_requests for select to authenticated using (public.is_trust_admin());
drop policy if exists "admin update scholarship requests" on public.scholarship_requests;
create policy "admin update scholarship requests" on public.scholarship_requests for update to authenticated using (public.is_trust_admin()) with check (public.is_trust_admin());
drop policy if exists "admin delete scholarship requests" on public.scholarship_requests;
create policy "admin delete scholarship requests" on public.scholarship_requests for delete to authenticated using (public.is_trust_admin());

drop policy if exists "public submit contact message" on public.contact_messages;
create policy "public submit contact message" on public.contact_messages for insert to anon, authenticated with check (status = 'new');
drop policy if exists "admin read contact messages" on public.contact_messages;
create policy "admin read contact messages" on public.contact_messages for select to authenticated using (public.is_trust_admin());
drop policy if exists "admin update contact messages" on public.contact_messages;
create policy "admin update contact messages" on public.contact_messages for update to authenticated using (public.is_trust_admin()) with check (public.is_trust_admin());
drop policy if exists "admin delete contact messages" on public.contact_messages;
create policy "admin delete contact messages" on public.contact_messages for delete to authenticated using (public.is_trust_admin());

drop policy if exists "public submit event interest" on public.event_interests;
create policy "public submit event interest" on public.event_interests for insert to anon, authenticated with check (status = 'new');
drop policy if exists "admin read event interests" on public.event_interests;
create policy "admin read event interests" on public.event_interests for select to authenticated using (public.is_trust_admin());
drop policy if exists "admin update event interests" on public.event_interests;
create policy "admin update event interests" on public.event_interests for update to authenticated using (public.is_trust_admin()) with check (public.is_trust_admin());
drop policy if exists "admin delete event interests" on public.event_interests;
create policy "admin delete event interests" on public.event_interests for delete to authenticated using (public.is_trust_admin());

-- Public can only see published events and campaigns; admins can manage them.
drop policy if exists "public read published events" on public.events;
create policy "public read published events" on public.events for select to anon, authenticated using (is_published = true or public.is_trust_admin());
drop policy if exists "admin insert events" on public.events;
create policy "admin insert events" on public.events for insert to authenticated with check (public.is_trust_admin());
drop policy if exists "admin update events" on public.events;
create policy "admin update events" on public.events for update to authenticated using (public.is_trust_admin()) with check (public.is_trust_admin());
drop policy if exists "admin delete events" on public.events;
create policy "admin delete events" on public.events for delete to authenticated using (public.is_trust_admin());

drop policy if exists "public read published campaigns" on public.campaigns;
create policy "public read published campaigns" on public.campaigns for select to anon, authenticated using (is_published = true or public.is_trust_admin());
drop policy if exists "admin insert campaigns" on public.campaigns;
create policy "admin insert campaigns" on public.campaigns for insert to authenticated with check (public.is_trust_admin());
drop policy if exists "admin update campaigns" on public.campaigns;
create policy "admin update campaigns" on public.campaigns for update to authenticated using (public.is_trust_admin()) with check (public.is_trust_admin());
drop policy if exists "admin delete campaigns" on public.campaigns;
create policy "admin delete campaigns" on public.campaigns for delete to authenticated using (public.is_trust_admin());

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.donation_pledges to anon, authenticated;
grant select, insert, update, delete on public.volunteer_applications to anon, authenticated;
grant select, insert, update, delete on public.scholarship_requests to anon, authenticated;
grant select, insert, update, delete on public.contact_messages to anon, authenticated;
grant select, insert, update, delete on public.event_interests to anon, authenticated;
grant select, insert, update, delete on public.events to anon, authenticated;
grant select, insert, update, delete on public.campaigns to anon, authenticated;

-- IMPORTANT: after signing up your own account, promote ONLY that trusted account:
-- update public.profiles set role = 'admin' where email = 'YOUR_TRUST_ADMIN_EMAIL';
-- If the profile row does not exist yet, insert it using the auth.users id:
-- insert into public.profiles (id, full_name, email, role)
-- select id, raw_user_meta_data->>'full_name', email, 'admin'
-- from auth.users where email = 'YOUR_TRUST_ADMIN_EMAIL'
-- on conflict (id) do update set role = 'admin';
