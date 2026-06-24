-- BuyerIQ v2.0 schema

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

create type public.project_mode as enum ('buying', 'renting', 'relocating');
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
create type public.region_key as enum ('southwest_florida', 'texas', 'washington', 'california', 'arizona', 'general');
create type public.condition_rating as enum ('excellent', 'good', 'average', 'poor', 'unknown');
create type public.question_status as enum ('draft', 'open', 'sent', 'answered', 'follow_up_required', 'closed');

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'standard', 'pro')),
  stripe_customer_id text,
  stripe_payment_id text,
  purchased_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  product_type text not null check (product_type in ('standard', 'pro')),
  stripe_customer_id text,
  stripe_payment_id text,
  stripe_checkout_session_id text unique,
  purchased_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.purchases enable row level security;

create policy "Users can view own purchases"
  on public.purchases for select
  using (auth.uid() = user_id);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create table public.buyer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users on delete cascade,
  name text,
  budget numeric(12, 2),
  desired_monthly_payment numeric(12, 2),
  household_size smallint,
  pets boolean,
  work_from_home boolean,
  school_importance smallint check (school_importance between 0 and 100),
  commute_importance smallint check (commute_importance between 0 and 100),
  retirement_planning boolean,
  accessibility_needs text,
  must_have_features text,
  nice_to_have_features text,
  deal_breakers text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.buyer_profiles enable row level security;

create policy "Users can manage own buyer profile"
  on public.buyer_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.lifestyle_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users on delete cascade,
  life_stage text check (
    life_stage in (
      'young_professional',
      'couple',
      'family_with_children',
      'empty_nester',
      'active_adult',
      'retiree',
      'other',
      'prefer_not_to_say'
    )
  ),
  age_range text,
  retirement_status text,
  household_size smallint,
  pet_ownership boolean,
  work_from_home boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lifestyle_profiles enable row level security;

create policy "Users can manage own lifestyle profile"
  on public.lifestyle_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.future_readiness_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users on delete cascade,
  reduce_driving text check (reduce_driving in ('yes', 'no', 'unsure')),
  accessibility_importance smallint check (accessibility_importance between 0 and 4),
  maintenance_tolerance text check (maintenance_tolerance in ('very_little', 'some', 'moderate', 'significant')),
  stair_tolerance text check (stair_tolerance in ('prefer_single_level', 'moderate_stairs', 'no_preference')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.future_readiness_profiles enable row level security;

create policy "Users can manage own future readiness profile"
  on public.future_readiness_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.user_priorities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users on delete cascade,
  hospitals smallint check (hospitals between 0 and 4),
  primary_care smallint check (primary_care between 0 and 4),
  specialists smallint check (specialists between 0 and 4),
  urgent_care smallint check (urgent_care between 0 and 4),
  pharmacies smallint check (pharmacies between 0 and 4),
  medical_centers smallint check (medical_centers between 0 and 4),
  grocery_stores smallint check (grocery_stores between 0 and 4),
  shopping smallint check (shopping between 0 and 4),
  banking smallint check (banking between 0 and 4),
  restaurants smallint check (restaurants between 0 and 4),
  coffee_shops smallint check (coffee_shops between 0 and 4),
  veterinarians smallint check (veterinarians between 0 and 4),
  golf smallint check (golf between 0 and 4),
  pickleball smallint check (pickleball between 0 and 4),
  beaches smallint check (beaches between 0 and 4),
  parks smallint check (parks between 0 and 4),
  walking_trails smallint check (walking_trails between 0 and 4),
  boating smallint check (boating between 0 and 4),
  fishing smallint check (fishing between 0 and 4),
  fitness_centers smallint check (fitness_centers between 0 and 4),
  churches smallint check (churches between 0 and 4),
  community_centers smallint check (community_centers between 0 and 4),
  volunteer_opportunities smallint check (volunteer_opportunities between 0 and 4),
  clubs smallint check (clubs between 0 and 4),
  senior_activities smallint check (senior_activities between 0 and 4),
  social_events smallint check (social_events between 0 and 4),
  schools smallint check (schools between 0 and 4),
  daycare smallint check (daycare between 0 and 4),
  family_activities smallint check (family_activities between 0 and 4),
  nearby_relatives smallint check (nearby_relatives between 0 and 4),
  public_transportation smallint check (public_transportation between 0 and 4),
  walkability smallint check (walkability between 0 and 4),
  bike_access smallint check (bike_access between 0 and 4),
  airport_access smallint check (airport_access between 0 and 4),
  ride_share smallint check (ride_share between 0 and 4),
  assisted_transportation smallint check (assisted_transportation between 0 and 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_priorities enable row level security;

create policy "Users can manage own priorities"
  on public.user_priorities for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  project_mode public.project_mode not null default 'buying',
  property_category public.property_category not null default 'single_family',
  region_key public.region_key not null default 'general',
  property_name text not null,
  address text not null,
  purchase_price numeric(12, 2),
  property_taxes numeric(12, 2),
  hoa_fees numeric(12, 2),
  insurance_estimate numeric(12, 2),
  bedrooms smallint,
  bathrooms numeric(3, 1),
  square_footage integer,
  lot_size text,
  year_built smallint,
  garage_spaces smallint,
  property_description text,
  buyer_notes text,
  nearby_amenities text,
  shopping_score smallint check (shopping_score between 0 and 100),
  healthcare_score smallint check (healthcare_score between 0 and 100),
  restaurants_score smallint check (restaurants_score between 0 and 100),
  parks_score smallint check (parks_score between 0 and 100),
  entertainment_score smallint check (entertainment_score between 0 and 100),
  walkability_score smallint check (walkability_score between 0 and 100),
  growing_family_score smallint check (growing_family_score between 0 and 100),
  retirement_score smallint check (retirement_score between 0 and 100),
  aging_in_place_score smallint check (aging_in_place_score between 0 and 100),
  resale_potential_score smallint check (resale_potential_score between 0 and 100),
  remote_work_score smallint check (remote_work_score between 0 and 100),
  roof_condition public.condition_rating not null default 'unknown',
  hvac_condition public.condition_rating not null default 'unknown',
  foundation_condition public.condition_rating not null default 'unknown',
  kitchen_condition public.condition_rating not null default 'unknown',
  bathrooms_condition public.condition_rating not null default 'unknown',
  flooring_condition public.condition_rating not null default 'unknown',
  windows_condition public.condition_rating not null default 'unknown',
  exterior_condition public.condition_rating not null default 'unknown',
  lease_terms text,
  move_timeline text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index properties_user_id_idx on public.properties (user_id);
alter table public.properties enable row level security;

create policy "Users can manage own properties"
  on public.properties for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.questions (
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

create index questions_user_id_idx on public.questions (user_id);
create index questions_property_id_idx on public.questions (property_id);
alter table public.questions enable row level security;

create policy "Users can manage own property questions"
  on public.questions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.email_logs (
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

create policy "Users can manage own email logs"
  on public.email_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  property_id uuid not null references public.properties on delete cascade,
  event_type text not null,
  title text not null,
  notes text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index timeline_events_property_id_idx on public.timeline_events (property_id);
alter table public.timeline_events enable row level security;

create policy "Users can manage own timeline events"
  on public.timeline_events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.property_documents (
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

create policy "Users can manage own property documents"
  on public.property_documents for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.property_photos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

alter table public.property_photos enable row level security;

create policy "Users can manage own property photos"
  on public.property_photos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.property_scores (
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

create policy "Users can manage own property scores"
  on public.property_scores for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.reports (
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

create policy "Users can manage own reports"
  on public.reports for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.regional_question_sets (
  id uuid primary key default gen_random_uuid(),
  region_key public.region_key not null,
  property_category public.property_category,
  category text not null,
  question_text text not null,
  created_at timestamptz not null default now()
);

alter table public.regional_question_sets enable row level security;

create policy "Users can read regional question sets"
  on public.regional_question_sets for select
  using (true);

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
  ('arizona', 'Climate', 'What should be verified about HVAC age, heat exposure, water availability, and drainage?');

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
    'free'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger buyer_profiles_updated_at
  before update on public.buyer_profiles
  for each row execute function public.set_updated_at();

create trigger lifestyle_profiles_updated_at
  before update on public.lifestyle_profiles
  for each row execute function public.set_updated_at();

create trigger future_readiness_profiles_updated_at
  before update on public.future_readiness_profiles
  for each row execute function public.set_updated_at();

create trigger user_priorities_updated_at
  before update on public.user_priorities
  for each row execute function public.set_updated_at();

create trigger properties_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

create trigger questions_updated_at
  before update on public.questions
  for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values
  ('property-photos', 'property-photos', false),
  ('property-documents', 'property-documents', false),
  ('lease-documents', 'lease-documents', false),
  ('hoa-documents', 'hoa-documents', false),
  ('inspection-documents', 'inspection-documents', false),
  ('reports', 'reports', false)
on conflict (id) do nothing;

create policy "Users can read own storage objects"
  on storage.objects for select
  using (
    bucket_id in ('property-photos', 'property-documents', 'lease-documents', 'hoa-documents', 'inspection-documents', 'reports')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can upload own storage objects"
  on storage.objects for insert
  with check (
    bucket_id in ('property-photos', 'property-documents', 'lease-documents', 'hoa-documents', 'inspection-documents', 'reports')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own storage objects"
  on storage.objects for update
  using (
    bucket_id in ('property-photos', 'property-documents', 'lease-documents', 'hoa-documents', 'inspection-documents', 'reports')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own storage objects"
  on storage.objects for delete
  using (
    bucket_id in ('property-photos', 'property-documents', 'lease-documents', 'hoa-documents', 'inspection-documents', 'reports')
    and auth.uid()::text = (storage.foldername(name))[1]
  );
