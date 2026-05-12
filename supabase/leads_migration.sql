-- Run this in your Supabase Dashboard → SQL Editor
-- Creates contact_submissions (seller leads) and partner_submissions (partner leads)
-- Safe to re-run: all statements use IF NOT EXISTS / ADD COLUMN IF NOT EXISTS

-- ─── contact_submissions (seller / homeowner leads) ───────────────────────

create table if not exists public.contact_submissions (
  id           uuid        default gen_random_uuid() primary key,
  name         text        not null,
  email        text,
  phone        text        not null,
  address      text        not null,
  best_time    text,
  message      text,
  form_type    text        not null default 'seller',
  lead_source  text        not null default 'formspree',
  status       text        not null default 'new'
                 check (status in ('new', 'contacted', 'qualified', 'closed', 'archived')),
  raw_payload  jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Safe upgrades if table existed before this migration
alter table public.contact_submissions add column if not exists email        text;
alter table public.contact_submissions add column if not exists best_time    text;
alter table public.contact_submissions add column if not exists form_type    text not null default 'seller';
alter table public.contact_submissions add column if not exists lead_source  text not null default 'formspree';
alter table public.contact_submissions add column if not exists status       text not null default 'new';
alter table public.contact_submissions add column if not exists raw_payload  jsonb;
alter table public.contact_submissions add column if not exists updated_at   timestamptz not null default now();

create index if not exists contact_submissions_status_date
  on public.contact_submissions (status, created_at desc);

-- ─── partner_submissions (investor / buyer leads) ─────────────────────────

create table if not exists public.partner_submissions (
  id             uuid        default gen_random_uuid() primary key,
  name           text        not null,
  email          text        not null,
  phone          text        not null,
  company        text,
  areas          text,
  property_types text,
  funding        text,
  volume         text,
  notes          text,
  form_type      text        not null default 'partner',
  lead_source    text        not null default 'formspree',
  status         text        not null default 'new'
                   check (status in ('new', 'contacted', 'qualified', 'closed', 'archived')),
  raw_payload    jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Safe upgrades if table existed before this migration
alter table public.partner_submissions add column if not exists company        text;
alter table public.partner_submissions add column if not exists areas          text;
alter table public.partner_submissions add column if not exists property_types text;
alter table public.partner_submissions add column if not exists funding        text;
alter table public.partner_submissions add column if not exists volume         text;
alter table public.partner_submissions add column if not exists notes          text;
alter table public.partner_submissions add column if not exists form_type      text not null default 'partner';
alter table public.partner_submissions add column if not exists lead_source    text not null default 'formspree';
alter table public.partner_submissions add column if not exists status         text not null default 'new';
alter table public.partner_submissions add column if not exists raw_payload    jsonb;
alter table public.partner_submissions add column if not exists updated_at     timestamptz not null default now();

create index if not exists partner_submissions_status_date
  on public.partner_submissions (status, created_at desc);

-- ─── Auto-update updated_at (reuses function from blog_posts_migration) ──

-- Create the function only if blog_posts_migration hasn't already done so
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists contact_submissions_updated_at on public.contact_submissions;
create trigger contact_submissions_updated_at
  before update on public.contact_submissions
  for each row execute function update_updated_at();

drop trigger if exists partner_submissions_updated_at on public.partner_submissions;
create trigger partner_submissions_updated_at
  before update on public.partner_submissions
  for each row execute function update_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────
-- Service role key bypasses RLS for all HQ writes.
-- No public-read policy — submissions are private to the admin.

alter table public.contact_submissions  enable row level security;
alter table public.partner_submissions  enable row level security;
