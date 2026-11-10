create table public.tracking_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind text not null check (kind in ('workout', 'meal', 'measurement', 'wearable', 'profile', 'saved_meal', 'habit', 'habit_progress')),
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  servings numeric check (servings > 0),
  created_at timestamptz not null default now()
);
create index tracking_entries_history_idx on public.tracking_entries (user_id, kind, created_at desc);
create unique index tracking_entries_profile_idx on public.tracking_entries (user_id) where kind = 'profile';
alter table public.tracking_entries enable row level security;
grant select, insert, update, delete on public.tracking_entries to authenticated;
create policy tracking_entries_owner on public.tracking_entries for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create table public.food_catalog (
  barcode text primary key,
  owner_id uuid default auth.uid() references auth.users(id) on delete set null,
  is_shared boolean not null default false,
  name text not null,
  nutrition jsonb not null check (jsonb_typeof(nutrition) = 'object')
);
create index food_catalog_owner_idx on public.food_catalog (owner_id);
create index food_catalog_name_idx on public.food_catalog (name);
alter table public.food_catalog enable row level security;
grant select, insert on public.food_catalog to authenticated;
create policy food_catalog_read on public.food_catalog for select to authenticated
  using (is_shared or owner_id = (select auth.uid()));
create policy food_catalog_insert on public.food_catalog for insert to authenticated
  with check (owner_id = (select auth.uid()) and (
    (is_shared and barcode ~ '^[0-9]{6,18}$')
    or (not is_shared and barcode like 'custom_%')
  ));

create table public.user_food_lists (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  list text not null check (list in ('pantry', 'favorite', 'recent')),
  barcode text not null references public.food_catalog(barcode) on delete cascade,
  touched_at timestamptz not null default now(),
  primary key (user_id, list, barcode)
);
create index user_food_lists_barcode_idx on public.user_food_lists (barcode);
create index user_food_lists_recency_idx on public.user_food_lists (user_id, list, touched_at desc);
alter table public.user_food_lists enable row level security;
grant select, insert, update, delete on public.user_food_lists to authenticated;
create policy user_food_lists_owner on public.user_food_lists for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.food_catalog where food_catalog.barcode = user_food_lists.barcode)
  );

create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  user_name text not null,
  user_photo text not null default '',
  content text not null check (length(trim(content)) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index community_posts_author_idx on public.community_posts (user_id);
create index community_posts_recent_idx on public.community_posts (created_at desc);
alter table public.community_posts enable row level security;
grant select, insert on public.community_posts to authenticated;
create policy community_posts_read on public.community_posts for select to authenticated using (true);
create policy community_posts_insert on public.community_posts for insert to authenticated
  with check (user_id = (select auth.uid()));
alter publication supabase_realtime add table public.community_posts;

revoke all on public.tracking_entries, public.food_catalog, public.user_food_lists, public.community_posts from anon;
