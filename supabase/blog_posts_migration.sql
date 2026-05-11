-- Run this in your Supabase Dashboard → SQL Editor
-- Creates the blog_posts table for the HQ Blog publishing workflow
-- Safe to re-run: all statements use IF NOT EXISTS / CREATE OR REPLACE

create table if not exists public.blog_posts (
  id              uuid default gen_random_uuid() primary key,
  slug            text not null unique,
  title           text not null,
  description     text,
  content         text not null default '',
  image_url       text,
  image_rotation  int not null default 0,
  image_position  text not null default 'center',
  seo_title       text,
  seo_description text,
  categories      text[] default '{}',
  tags            text[] default '{}',
  status          text not null default 'draft'
                    check (status in ('draft', 'published')),
  author          text not null default 'Island Investors NJ',
  read_time       text,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null,
  published_at    timestamptz
);

-- Add image columns if table existed before these were introduced
alter table public.blog_posts
  add column if not exists image_rotation int not null default 0;
alter table public.blog_posts
  add column if not exists image_position text not null default 'center';

create index if not exists blog_posts_status_date
  on public.blog_posts (status, published_at desc nulls last);

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists blog_posts_updated_at on public.blog_posts;
create trigger blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function update_updated_at();

alter table public.blog_posts enable row level security;

drop policy if exists "public_read_published" on public.blog_posts;
create policy "public_read_published" on public.blog_posts
  for select to anon, authenticated
  using (status = 'published');
-- Note: service role key bypasses RLS, used for all HQ write operations
