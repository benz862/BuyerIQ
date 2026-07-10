alter table public.buyer_profiles
  add column if not exists requires_pool boolean not null default false,
  add column if not exists requires_lanai boolean not null default false,
  add column if not exists requires_no_carpet boolean not null default false,
  add column if not exists minimum_garage_spaces smallint;

alter table public.properties
  add column if not exists has_pool boolean,
  add column if not exists has_lanai boolean,
  add column if not exists flooring_type text not null default 'unknown';

alter table public.properties
  drop constraint if exists properties_flooring_type_check;

alter table public.properties
  add constraint properties_flooring_type_check
  check (flooring_type in ('unknown', 'hard_surface', 'mixed', 'carpet'));
