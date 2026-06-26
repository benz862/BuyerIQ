create table if not exists saved_properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  source text not null default 'rentcast',
  source_property_id text not null,
  listing_type text not null,
  address text not null,
  city text,
  state text,
  zip_code text,
  price numeric,
  bedrooms numeric,
  bathrooms numeric,
  square_feet numeric,
  property_type text,
  latitude numeric not null,
  longitude numeric not null,
  photos jsonb not null default '[]'::jsonb,
  listing_url text,
  status text,
  listed_date text,
  days_on_market numeric,
  notes text,
  created_at timestamptz not null default now()
);

alter table saved_properties enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'saved_properties'
      and policyname = 'Users can view their own saved properties'
  ) then
    create policy "Users can view their own saved properties"
    on saved_properties
    for select
    using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'saved_properties'
      and policyname = 'Users can insert their own saved properties'
  ) then
    create policy "Users can insert their own saved properties"
    on saved_properties
    for insert
    with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'saved_properties'
      and policyname = 'Users can update their own saved properties'
  ) then
    create policy "Users can update their own saved properties"
    on saved_properties
    for update
    using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'saved_properties'
      and policyname = 'Users can delete their own saved properties'
  ) then
    create policy "Users can delete their own saved properties"
    on saved_properties
    for delete
    using (auth.uid() = user_id);
  end if;
end $$;
