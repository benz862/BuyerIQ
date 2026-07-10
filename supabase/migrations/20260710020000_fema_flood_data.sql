alter table public.properties
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists fema_flood_status text,
  add column if not exists fema_flood_zone text,
  add column if not exists fema_zone_subtype text,
  add column if not exists fema_sfha boolean,
  add column if not exists fema_base_flood_elevation numeric,
  add column if not exists fema_flood_depth numeric,
  add column if not exists fema_flood_risk_level text,
  add column if not exists fema_checked_at timestamptz;

alter table public.properties drop constraint if exists properties_fema_flood_status_check;
alter table public.properties add constraint properties_fema_flood_status_check
  check (fema_flood_status is null or fema_flood_status in ('mapped', 'not_mapped', 'unavailable'));

alter table public.properties drop constraint if exists properties_fema_flood_risk_level_check;
alter table public.properties add constraint properties_fema_flood_risk_level_check
  check (fema_flood_risk_level is null or fema_flood_risk_level in ('high', 'moderate', 'minimal', 'undetermined'));
