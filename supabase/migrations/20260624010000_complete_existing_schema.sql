-- BuyerIQ v2 compatibility migration for partially initialized projects.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$ begin
  create type public.project_mode as enum ('buying', 'renting', 'relocating');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.property_category as enum (
    'single_family',
    'condo',
    'townhome',
    'apartment',
    'rental_home',
    '55_plus',
    'new_construction',
    'vacant_land',
    'investment'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.region_key as enum ('southwest_florida', 'texas', 'washington', 'california', 'arizona', 'general');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.condition_rating as enum ('excellent', 'good', 'average', 'poor', 'unknown');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.question_status as enum ('draft', 'open', 'sent', 'answered', 'follow_up_required', 'closed');
exception when duplicate_object then null;
end $$;

alter table public.properties add column if not exists project_mode public.project_mode not null default 'buying';
alter table public.properties add column if not exists property_category public.property_category not null default 'single_family';
alter table public.properties add column if not exists region_key public.region_key not null default 'general';
alter table public.properties add column if not exists property_name text;
alter table public.properties add column if not exists purchase_price numeric(12, 2);
alter table public.properties add column if not exists property_taxes numeric(12, 2);
alter table public.properties add column if not exists hoa_fees numeric(12, 2);
alter table public.properties add column if not exists insurance_estimate numeric(12, 2);
alter table public.properties add column if not exists square_footage integer;
alter table public.properties add column if not exists garage_spaces smallint;
alter table public.properties add column if not exists property_description text;
alter table public.properties add column if not exists buyer_notes text;
alter table public.properties add column if not exists nearby_amenities text;
alter table public.properties add column if not exists shopping_score smallint check (shopping_score between 0 and 100);
alter table public.properties add column if not exists healthcare_score smallint check (healthcare_score between 0 and 100);
alter table public.properties add column if not exists restaurants_score smallint check (restaurants_score between 0 and 100);
alter table public.properties add column if not exists parks_score smallint check (parks_score between 0 and 100);
alter table public.properties add column if not exists entertainment_score smallint check (entertainment_score between 0 and 100);
alter table public.properties add column if not exists walkability_score smallint check (walkability_score between 0 and 100);
alter table public.properties add column if not exists growing_family_score smallint check (growing_family_score between 0 and 100);
alter table public.properties add column if not exists retirement_score smallint check (retirement_score between 0 and 100);
alter table public.properties add column if not exists aging_in_place_score smallint check (aging_in_place_score between 0 and 100);
alter table public.properties add column if not exists resale_potential_score smallint check (resale_potential_score between 0 and 100);
alter table public.properties add column if not exists remote_work_score smallint check (remote_work_score between 0 and 100);
alter table public.properties add column if not exists roof_condition public.condition_rating not null default 'unknown';
alter table public.properties add column if not exists hvac_condition public.condition_rating not null default 'unknown';
alter table public.properties add column if not exists foundation_condition public.condition_rating not null default 'unknown';
alter table public.properties add column if not exists kitchen_condition public.condition_rating not null default 'unknown';
alter table public.properties add column if not exists bathrooms_condition public.condition_rating not null default 'unknown';
alter table public.properties add column if not exists flooring_condition public.condition_rating not null default 'unknown';
alter table public.properties add column if not exists windows_condition public.condition_rating not null default 'unknown';
alter table public.properties add column if not exists exterior_condition public.condition_rating not null default 'unknown';
alter table public.properties add column if not exists lease_terms text;
alter table public.properties add column if not exists move_timeline text;

update public.properties
set
  property_name = coalesce(property_name, address, 'Property'),
  purchase_price = coalesce(purchase_price, price),
  square_footage = coalesce(square_footage, square_feet),
  buyer_notes = coalesce(buyer_notes, notes)
where property_name is null
  or purchase_price is null
  or square_footage is null
  or buyer_notes is null;

alter table public.properties alter column property_name set not null;

create index if not exists properties_user_id_idx on public.properties (user_id);
alter table public.properties enable row level security;

drop policy if exists "Users can manage own properties" on public.properties;
create policy "Users can manage own properties"
  on public.properties for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  property_id uuid not null references public.properties on delete cascade,
  category text not null default 'General',
  question_text text not null,
  recipient_name text,
  recipient_email text,
  status public.question_status not null default 'open',
  answer_text text,
  sent_at timestamptz,
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists questions_user_id_idx on public.questions (user_id);
create index if not exists questions_property_id_idx on public.questions (property_id);
alter table public.questions enable row level security;
drop policy if exists "Users can manage own property questions" on public.questions;
create policy "Users can manage own property questions"
  on public.questions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  property_id uuid not null references public.properties on delete cascade,
  question_id uuid references public.questions on delete set null,
  recipient_name text,
  recipient_email text not null,
  subject text not null,
  body text,
  status text not null default 'queued',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.email_logs enable row level security;
drop policy if exists "Users can manage own email logs" on public.email_logs;
create policy "Users can manage own email logs"
  on public.email_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  property_id uuid not null references public.properties on delete cascade,
  event_type text not null,
  title text not null,
  notes text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists timeline_events_property_id_idx on public.timeline_events (property_id);
alter table public.timeline_events enable row level security;
drop policy if exists "Users can manage own timeline events" on public.timeline_events;
create policy "Users can manage own timeline events"
  on public.timeline_events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.property_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  property_id uuid not null references public.properties on delete cascade,
  document_type text not null,
  file_name text not null,
  storage_path text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.property_documents enable row level security;
drop policy if exists "Users can manage own property documents" on public.property_documents;
create policy "Users can manage own property documents"
  on public.property_documents for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.property_photos add column if not exists caption text;
alter table public.property_photos enable row level security;
drop policy if exists "Users can manage own property photos" on public.property_photos;
create policy "Users can manage own property photos"
  on public.property_photos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.property_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  property_id uuid not null references public.properties on delete cascade,
  property_fit_score smallint not null check (property_fit_score between 0 and 100),
  risk_score smallint not null check (risk_score between 0 and 100),
  lifestyle_score smallint not null check (lifestyle_score between 0 and 100),
  cost_score smallint not null check (cost_score between 0 and 100),
  confidence_score smallint not null check (confidence_score between 0 and 100),
  information_completeness_score smallint not null check (information_completeness_score between 0 and 100),
  explanations jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.property_scores enable row level security;
drop policy if exists "Users can manage own property scores" on public.property_scores;
create policy "Users can manage own property scores"
  on public.property_scores for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  property_score smallint not null check (property_score between 0 and 100),
  information_completeness_score smallint not null check (information_completeness_score between 0 and 100),
  recommendation text not null,
  report_payload jsonb not null default '{}'::jsonb,
  pdf_storage_path text,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;
drop policy if exists "Users can manage own reports" on public.reports;
create policy "Users can manage own reports"
  on public.reports for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.regional_question_sets (
  id uuid primary key default gen_random_uuid(),
  region_key public.region_key not null,
  property_category public.property_category,
  category text not null,
  question_text text not null,
  created_at timestamptz not null default now()
);

alter table public.regional_question_sets enable row level security;
drop policy if exists "Users can read regional question sets" on public.regional_question_sets;
create policy "Users can read regional question sets"
  on public.regional_question_sets for select
  using (true);

create unique index if not exists regional_question_sets_unique_idx
  on public.regional_question_sets (region_key, category, question_text);

insert into public.regional_question_sets (region_key, category, question_text)
values
  ('southwest_florida', 'Flood Risk', 'What flood zone is the property in, and is flood insurance required or strongly recommended?'),
  ('southwest_florida', 'Insurance', 'Are wind, hurricane, and flood insurance available, and what are the estimated premiums?'),
  ('southwest_florida', 'Roof', 'What is the roof age, roof material, and remaining useful life?'),
  ('southwest_florida', 'Wind Mitigation', 'Is there a current wind mitigation report?'),
  ('southwest_florida', 'Windows', 'Are windows impact-rated or protected by shutters?'),
  ('southwest_florida', 'HOA', 'What are the HOA reserves, pending assessments, and recent fee increases?'),
  ('southwest_florida', 'Condo', 'Are milestone inspections complete and are any condo assessments pending?'),
  ('southwest_florida', 'Waterfront', 'What is the seawall condition and expected replacement timeline?'),
  ('texas', 'Foundation', 'Is there evidence of foundation movement or clay soil impact?'),
  ('washington', 'Moisture', 'Is there evidence of moisture intrusion, drainage problems, roof moss, or mold risk?'),
  ('california', 'Hazards', 'Is the property affected by wildfire zones, earthquake risk, insurance limitations, or drought restrictions?'),
  ('arizona', 'Climate', 'What should be verified about HVAC age, heat exposure, water availability, and drainage?')
on conflict do nothing;

create or replace function public.protect_user_profile_billing_fields()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() = old.id then
    new.plan := old.plan;
    new.stripe_customer_id := old.stripe_customer_id;
    new.stripe_payment_id := old.stripe_payment_id;
    new.purchased_at := old.purchased_at;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_user_profile_billing_fields on public.profiles;
create trigger protect_user_profile_billing_fields
  before update on public.profiles
  for each row execute function public.protect_user_profile_billing_fields();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, plan)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    coalesce(new.raw_app_meta_data ->> 'buyer_iq_plan', 'free')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists buyer_profiles_updated_at on public.buyer_profiles;
create trigger buyer_profiles_updated_at before update on public.buyer_profiles for each row execute function public.set_updated_at();
drop trigger if exists lifestyle_profiles_updated_at on public.lifestyle_profiles;
create trigger lifestyle_profiles_updated_at before update on public.lifestyle_profiles for each row execute function public.set_updated_at();
drop trigger if exists future_readiness_profiles_updated_at on public.future_readiness_profiles;
create trigger future_readiness_profiles_updated_at before update on public.future_readiness_profiles for each row execute function public.set_updated_at();
drop trigger if exists user_priorities_updated_at on public.user_priorities;
create trigger user_priorities_updated_at before update on public.user_priorities for each row execute function public.set_updated_at();
drop trigger if exists properties_updated_at on public.properties;
create trigger properties_updated_at before update on public.properties for each row execute function public.set_updated_at();
drop trigger if exists questions_updated_at on public.questions;
create trigger questions_updated_at before update on public.questions for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values
  ('property-photos', 'property-photos', false),
  ('property-documents', 'property-documents', false),
  ('lease-documents', 'lease-documents', false),
  ('hoa-documents', 'hoa-documents', false),
  ('inspection-documents', 'inspection-documents', false),
  ('reports', 'reports', false)
on conflict (id) do nothing;

drop policy if exists "Users can read own storage objects" on storage.objects;
create policy "Users can read own storage objects"
  on storage.objects for select
  using (
    bucket_id in ('property-photos', 'property-documents', 'lease-documents', 'hoa-documents', 'inspection-documents', 'reports')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can upload own storage objects" on storage.objects;
create policy "Users can upload own storage objects"
  on storage.objects for insert
  with check (
    bucket_id in ('property-photos', 'property-documents', 'lease-documents', 'hoa-documents', 'inspection-documents', 'reports')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can update own storage objects" on storage.objects;
create policy "Users can update own storage objects"
  on storage.objects for update
  using (
    bucket_id in ('property-photos', 'property-documents', 'lease-documents', 'hoa-documents', 'inspection-documents', 'reports')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete own storage objects" on storage.objects;
create policy "Users can delete own storage objects"
  on storage.objects for delete
  using (
    bucket_id in ('property-photos', 'property-documents', 'lease-documents', 'hoa-documents', 'inspection-documents', 'reports')
    and auth.uid()::text = (storage.foldername(name))[1]
  );
