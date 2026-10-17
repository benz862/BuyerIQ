alter table public.buyer_profiles
  add column if not exists minimum_bedrooms integer check (minimum_bedrooms is null or minimum_bedrooms between 0 and 20),
  add column if not exists minimum_bathrooms numeric check (minimum_bathrooms is null or minimum_bathrooms between 0 and 20),
  add column if not exists minimum_square_footage integer check (minimum_square_footage is null or minimum_square_footage between 0 and 50000);
