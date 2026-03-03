create table public.providers (
  id uuid not null default gen_random_uuid (),
  provider_name text not null,
  category text null,
  location text null,
  contact_info text null,
  platform text null default 'Justdial'::text,
  rating text null,
  created_at timestamp with time zone null default now(),
  constraint providers_pkey primary key (id)
) TABLESPACE pg_default;