-- BuyerIQ property media and contact support.

create table if not exists public.property_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  property_id uuid not null references public.properties on delete cascade,
  contact_type text not null default 'realtor',
  name text not null,
  company text,
  role text,
  email text,
  phone text,
  photo_storage_path text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists property_contacts_property_id_idx on public.property_contacts (property_id);
create index if not exists property_contacts_user_id_idx on public.property_contacts (user_id);
alter table public.property_contacts enable row level security;

drop policy if exists "Users can manage own property contacts" on public.property_contacts;
create policy "Users can manage own property contacts"
  on public.property_contacts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists property_contacts_updated_at on public.property_contacts;
create trigger property_contacts_updated_at
  before update on public.property_contacts
  for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('contact-photos', 'contact-photos', false)
on conflict (id) do nothing;

drop policy if exists "Users can read own storage objects" on storage.objects;
create policy "Users can read own storage objects"
  on storage.objects for select
  using (
    bucket_id in ('property-photos', 'property-documents', 'lease-documents', 'hoa-documents', 'inspection-documents', 'reports', 'contact-photos')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can upload own storage objects" on storage.objects;
create policy "Users can upload own storage objects"
  on storage.objects for insert
  with check (
    bucket_id in ('property-photos', 'property-documents', 'lease-documents', 'hoa-documents', 'inspection-documents', 'reports', 'contact-photos')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can update own storage objects" on storage.objects;
create policy "Users can update own storage objects"
  on storage.objects for update
  using (
    bucket_id in ('property-photos', 'property-documents', 'lease-documents', 'hoa-documents', 'inspection-documents', 'reports', 'contact-photos')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete own storage objects" on storage.objects;
create policy "Users can delete own storage objects"
  on storage.objects for delete
  using (
    bucket_id in ('property-photos', 'property-documents', 'lease-documents', 'hoa-documents', 'inspection-documents', 'reports', 'contact-photos')
    and auth.uid()::text = (storage.foldername(name))[1]
  );
