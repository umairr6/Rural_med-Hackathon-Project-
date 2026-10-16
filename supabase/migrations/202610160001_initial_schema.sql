-- RuralMed initial schema. Review applicable Indian laws and have a qualified security reviewer assess this before real patient data is used.
create extension if not exists pgcrypto;

create type public.app_role as enum ('patient','pharmacy','admin');
create type public.pharmacy_verification_status as enum ('pending','approved','rejected','suspended');
create type public.order_status as enum ('requested','under_review','quoted','accepted','preparing','out_for_delivery','delivered','rejected','cancelled','delivery_failed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role public.app_role not null default 'patient',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.villages (
  id uuid primary key default gen_random_uuid(),
  region text not null check (region in ('Jammu','Kashmir')),
  district text not null,
  name text not null,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now(),
  unique(region,district,name),
  check (latitude is null or latitude between -90 and 90),
  check (longitude is null or longitude between -180 and 180)
);

create table public.pharmacies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  name text not null,
  contact_name text not null,
  phone text not null,
  email text,
  address text not null,
  district text not null,
  licence_number text not null,
  verification_status public.pharmacy_verification_status not null default 'pending',
  is_active boolean not null default false,
  delivery_available boolean not null default false,
  delivery_fee numeric(10,2) check (delivery_fee is null or delivery_fee >= 0),
  opening_hours jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index pharmacies_licence_unique on public.pharmacies(licence_number);

create table public.pharmacy_service_areas (
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  village_id uuid not null references public.villages(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(pharmacy_id,village_id)
);

create table public.medicines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  generic_name text,
  strength text,
  dosage_form text,
  prescription_required boolean not null default true,
  eligible_for_platform boolean not null default false,
  created_at timestamptz not null default now()
);
create index medicines_name_search on public.medicines using gin (to_tsvector('simple', name || ' ' || coalesce(generic_name,'')));

create table public.pharmacy_inventory (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  medicine_id uuid not null references public.medicines(id) on delete restrict,
  availability_note text,
  indicative_price numeric(10,2) check (indicative_price is null or indicative_price >= 0),
  last_confirmed_at timestamptz,
  unique(pharmacy_id,medicine_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete restrict,
  village_id uuid references public.villages(id) on delete set null,
  region text not null check (region in ('Jammu','Kashmir')),
  district text not null,
  village_name text not null,
  landmark text,
  delivery_address text not null,
  status public.order_status not null default 'requested',
  patient_note text,
  accepted_quote_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_patient_created on public.orders(patient_id,created_at desc);
create index orders_status_created on public.orders(status,created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  medicine_id uuid references public.medicines(id) on delete restrict,
  medicine_name text not null,
  strength text,
  dosage_form text,
  quantity integer not null check (quantity between 1 and 100),
  created_at timestamptz not null default now()
);

create table public.pharmacy_quotes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  pharmacy_id uuid not null references public.pharmacies(id) on delete restrict,
  medicine_subtotal numeric(10,2) not null check (medicine_subtotal >= 0),
  delivery_fee numeric(10,2) not null check (delivery_fee >= 0),
  total_amount numeric(10,2) generated always as (medicine_subtotal + delivery_fee) stored,
  availability_confirmed boolean not null default false,
  prescription_reviewed boolean not null default false,
  quote_note text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique(id,order_id)
);
alter table public.orders add constraint orders_accepted_quote_fk foreign key (accepted_quote_id) references public.pharmacy_quotes(id) on delete set null;

create table public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  patient_id uuid not null references public.profiles(id) on delete restrict,
  storage_path text not null,
  review_status text not null default 'pending' check (review_status in ('pending','approved','rejected','not_required')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  pharmacy_id uuid not null references public.pharmacies(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending','preparing','out_for_delivery','delivered','failed','cancelled')),
  delivery_note text,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  changed_by uuid references public.profiles(id) on delete set null,
  old_status public.order_status,
  new_status public.order_status not null,
  note text,
  created_at timestamptz not null default now()
);
create index order_events_order_created on public.order_status_events(order_id,created_at);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Role must be provisioned by a trusted server/admin workflow; never trust client-provided role values.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles(id,full_name,role)
  values(new.id, coalesce(new.raw_user_meta_data ->> 'full_name',''), 'patient');
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.current_app_role()
returns public.app_role language sql stable security invoker
as $$ select role from public.profiles where id = (select auth.uid()) $$;

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql
as $$ begin new.updated_at = now(); return new; end; $$;
create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger pharmacies_updated_at before update on public.pharmacies for each row execute procedure public.set_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute procedure public.set_updated_at();
create trigger deliveries_updated_at before update on public.deliveries for each row execute procedure public.set_updated_at();

-- RLS enabled on every table.
alter table public.profiles enable row level security;
alter table public.villages enable row level security;
alter table public.pharmacies enable row level security;
alter table public.pharmacy_service_areas enable row level security;
alter table public.medicines enable row level security;
alter table public.pharmacy_inventory enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.pharmacy_quotes enable row level security;
alter table public.prescriptions enable row level security;
alter table public.deliveries enable row level security;
alter table public.order_status_events enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles for select to authenticated
using (id = (select auth.uid()) or public.current_app_role() = 'admin');
create policy "profiles_update_own_non_role" on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()) and role = public.current_app_role());
create policy "villages_read_authenticated" on public.villages for select to authenticated using (true);
create policy "pharmacy_public_approved_read" on public.pharmacies for select to authenticated
using (verification_status = 'approved' and is_active = true or owner_id = (select auth.uid()) or public.current_app_role() = 'admin');
create policy "pharmacy_owner_insert_pending" on public.pharmacies for insert to authenticated
with check (owner_id = (select auth.uid()) and verification_status = 'pending' and is_active = false and public.current_app_role() = 'pharmacy');
create policy "pharmacy_owner_update_pending_only" on public.pharmacies for update to authenticated
using (owner_id = (select auth.uid()) and verification_status = 'pending')
with check (owner_id = (select auth.uid()) and verification_status = 'pending' and is_active = false);
create policy "admin_manage_pharmacies" on public.pharmacies for all to authenticated
using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');
create policy "service_areas_read_authenticated" on public.pharmacy_service_areas for select to authenticated using (true);
create policy "admin_manage_service_areas" on public.pharmacy_service_areas for all to authenticated using (public.current_app_role()='admin') with check (public.current_app_role()='admin');
create policy "medicines_read_eligible" on public.medicines for select to authenticated using (eligible_for_platform = true or public.current_app_role()='admin');
create policy "admin_manage_medicines" on public.medicines for all to authenticated using (public.current_app_role()='admin') with check (public.current_app_role()='admin');
create policy "inventory_read_approved_pharmacies" on public.pharmacy_inventory for select to authenticated
using (exists(select 1 from public.pharmacies p where p.id=pharmacy_id and (p.owner_id=(select auth.uid()) or (p.verification_status='approved' and p.is_active=true))));
create policy "inventory_owner_manage" on public.pharmacy_inventory for all to authenticated
using (exists(select 1 from public.pharmacies p where p.id=pharmacy_id and p.owner_id=(select auth.uid()) and p.verification_status='approved' and p.is_active=true))
with check (exists(select 1 from public.pharmacies p where p.id=pharmacy_id and p.owner_id=(select auth.uid()) and p.verification_status='approved' and p.is_active=true));
create policy "orders_patient_select" on public.orders for select to authenticated
using (patient_id=(select auth.uid()) or public.current_app_role()='admin' or exists(select 1 from public.pharmacy_quotes q join public.pharmacies p on p.id=q.pharmacy_id where q.order_id=id and p.owner_id=(select auth.uid())));
create policy "orders_patient_insert" on public.orders for insert to authenticated
with check (patient_id=(select auth.uid()) and public.current_app_role()='patient' and status='requested');
create policy "orders_admin_update" on public.orders for update to authenticated
using (public.current_app_role()='admin') with check (public.current_app_role()='admin');
create policy "order_items_select_authorized" on public.order_items for select to authenticated
using (exists(select 1 from public.orders o where o.id=order_id and (o.patient_id=(select auth.uid()) or public.current_app_role()='admin' or exists(select 1 from public.pharmacy_quotes q join public.pharmacies p on p.id=q.pharmacy_id where q.order_id=o.id and p.owner_id=(select auth.uid())))));
create policy "order_items_insert_patient_own" on public.order_items for insert to authenticated
with check (exists(select 1 from public.orders o where o.id=order_id and o.patient_id=(select auth.uid()) and o.status='requested'));
create policy "quotes_patient_or_pharmacy_select" on public.pharmacy_quotes for select to authenticated
using (exists(select 1 from public.orders o where o.id=order_id and o.patient_id=(select auth.uid())) or exists(select 1 from public.pharmacies p where p.id=pharmacy_id and p.owner_id=(select auth.uid())) or public.current_app_role()='admin');
create policy "approved_pharmacy_insert_quote" on public.pharmacy_quotes for insert to authenticated
with check (exists(select 1 from public.pharmacies p where p.id=pharmacy_id and p.owner_id=(select auth.uid()) and p.verification_status='approved' and p.is_active=true) and exists(select 1 from public.orders o where o.id=order_id and o.status in ('requested','under_review')));
create policy "admin_quote_read" on public.pharmacy_quotes for update to authenticated
using (public.current_app_role()='admin') with check (public.current_app_role()='admin');
create policy "prescription_patient_select_insert" on public.prescriptions for select to authenticated using (patient_id=(select auth.uid()) or public.current_app_role()='admin' or exists(select 1 from public.orders o join public.pharmacy_quotes q on q.order_id=o.id join public.pharmacies p on p.id=q.pharmacy_id where o.id=order_id and p.owner_id=(select auth.uid())));
create policy "prescription_patient_insert" on public.prescriptions for insert to authenticated with check (patient_id=(select auth.uid()) and exists(select 1 from public.orders o where o.id=order_id and o.patient_id=(select auth.uid())));
create policy "delivery_authorized_select" on public.deliveries for select to authenticated using (exists(select 1 from public.orders o where o.id=order_id and o.patient_id=(select auth.uid())) or exists(select 1 from public.pharmacies p where p.id=pharmacy_id and p.owner_id=(select auth.uid())) or public.current_app_role()='admin');
create policy "approved_pharmacy_manage_delivery" on public.deliveries for all to authenticated using (exists(select 1 from public.pharmacies p where p.id=pharmacy_id and p.owner_id=(select auth.uid()) and p.verification_status='approved' and p.is_active=true)) with check (exists(select 1 from public.pharmacies p where p.id=pharmacy_id and p.owner_id=(select auth.uid()) and p.verification_status='approved' and p.is_active=true));
create policy "events_authorized_select" on public.order_status_events for select to authenticated using (exists(select 1 from public.orders o where o.id=order_id and (o.patient_id=(select auth.uid()) or public.current_app_role()='admin' or exists(select 1 from public.pharmacy_quotes q join public.pharmacies p on p.id=q.pharmacy_id where q.order_id=o.id and p.owner_id=(select auth.uid())))));
create policy "events_admin_insert" on public.order_status_events for insert to authenticated with check (public.current_app_role()='admin');
create policy "audit_admin_select" on public.audit_logs for select to authenticated using (public.current_app_role()='admin');
-- Audit inserts should be done through trusted server code, not directly by clients.
