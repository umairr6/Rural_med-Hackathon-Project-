-- Live workflow hardening for the RuralMed hackathon MVP.
-- Review these policies/functions in a disposable Supabase project before any real data is used.

alter table public.orders add column if not exists patient_phone text;

-- Allow an authenticated patient to remove only their own still-unquoted request if needed.
create policy "patients_delete_own_unquoted_requests" on public.orders for delete to authenticated
using (patient_id = (select auth.uid()) and status = 'requested' and not exists (select 1 from public.pharmacy_quotes q where q.order_id = id));

-- A pharmacy account remains a patient until an administrator verifies and promotes it.
-- This policy permits an application to be created by the signed-in owner, but not to self-approve.
create policy "owner_submit_pending_pharmacy_application" on public.pharmacies for insert to authenticated
with check (owner_id = (select auth.uid()) and verification_status = 'pending' and is_active = false);

create or replace function public.accept_pharmacy_quote(p_order_id uuid, p_quote_id uuid)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_quote public.pharmacy_quotes%rowtype;
  v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  select * into v_order from public.orders where id = p_order_id for update;
  if not found or v_order.patient_id <> v_user then raise exception 'Request not found'; end if;
  if v_order.status not in ('quoted','under_review','requested') then raise exception 'Request is not accepting quotes'; end if;
  select * into v_quote from public.pharmacy_quotes where id = p_quote_id and order_id = p_order_id for update;
  if not found or not v_quote.availability_confirmed then raise exception 'Quote is not valid or availability is unconfirmed'; end if;
  if not exists(select 1 from public.pharmacies p where p.id=v_quote.pharmacy_id and p.verification_status='approved' and p.is_active=true) then raise exception 'The pharmacy is no longer approved for fulfilment'; end if;
  if exists(select 1 from public.orders where id = p_order_id and accepted_quote_id is not null) then raise exception 'A quote has already been accepted'; end if;
  update public.orders set accepted_quote_id = p_quote_id, status = 'accepted', updated_at = now() where id = p_order_id;
  insert into public.deliveries(order_id, pharmacy_id, status) values (p_order_id, v_quote.pharmacy_id, 'pending')
  on conflict (order_id) do nothing;
  insert into public.order_status_events(order_id, changed_by, old_status, new_status, note)
  values (p_order_id, v_user, v_order.status, 'accepted', 'Patient accepted a pharmacy quote');
  return jsonb_build_object('order_id', p_order_id, 'quote_id', p_quote_id, 'status', 'accepted');
end;
$$;
revoke all on function public.accept_pharmacy_quote(uuid,uuid) from public;
grant execute on function public.accept_pharmacy_quote(uuid,uuid) to authenticated;

create or replace function public.submit_pharmacy_quote(
  p_order_id uuid,
  p_medicine_subtotal numeric,
  p_delivery_fee numeric,
  p_availability_confirmed boolean,
  p_prescription_reviewed boolean,
  p_quote_note text default ''
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_pharmacy public.pharmacies%rowtype;
  v_order public.orders%rowtype;
  v_quote public.pharmacy_quotes%rowtype;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if p_medicine_subtotal < 0 or p_delivery_fee < 0 or p_medicine_subtotal > 1000000 or p_delivery_fee > 100000 then raise exception 'Invalid quote amounts'; end if;
  if p_availability_confirmed is distinct from true then raise exception 'Confirm availability before quoting'; end if;
  select * into v_pharmacy from public.pharmacies where owner_id = v_user and verification_status = 'approved' and is_active = true limit 1;
  if not found then raise exception 'An approved active pharmacy account is required'; end if;
  select * into v_order from public.orders where id = p_order_id for update;
  if not found or v_order.status not in ('requested','under_review','quoted') then raise exception 'Request is not available for quoting'; end if;
  if v_order.district <> v_pharmacy.district then raise exception 'This request is outside your registered district'; end if;
  if exists(select 1 from public.pharmacy_service_areas sa where sa.pharmacy_id = v_pharmacy.id)
     and not exists(select 1 from public.pharmacy_service_areas sa where sa.pharmacy_id = v_pharmacy.id and sa.village_id = v_order.village_id) then
    raise exception 'This request is outside your configured village service area';
  end if;
  insert into public.pharmacy_quotes(order_id, pharmacy_id, medicine_subtotal, delivery_fee, availability_confirmed, prescription_reviewed, quote_note)
  values(p_order_id, v_pharmacy.id, p_medicine_subtotal, p_delivery_fee, true, coalesce(p_prescription_reviewed,false), left(coalesce(p_quote_note,''),1000))
  returning * into v_quote;
  update public.orders set status = 'quoted', updated_at = now() where id = p_order_id and status in ('requested','under_review');
  insert into public.order_status_events(order_id, changed_by, old_status, new_status, note)
  values(p_order_id, v_user, v_order.status, 'quoted', 'An approved pharmacy submitted a quote');
  return jsonb_build_object('quote_id', v_quote.id, 'order_id', v_quote.order_id, 'total_amount', v_quote.total_amount);
end;
$$;
revoke all on function public.submit_pharmacy_quote(uuid,numeric,numeric,boolean,boolean,text) from public;
grant execute on function public.submit_pharmacy_quote(uuid,numeric,numeric,boolean,boolean,text) to authenticated;

create or replace function public.update_pharmacy_delivery(
  p_order_id uuid,
  p_status text,
  p_note text default ''
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_order public.orders%rowtype;
  v_delivery public.deliveries%rowtype;
  v_next public.order_status;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if p_status not in ('preparing','out_for_delivery','delivered','delivery_failed') then raise exception 'Invalid delivery status'; end if;
  select o.* into v_order from public.orders o join public.pharmacy_quotes q on q.id=o.accepted_quote_id join public.pharmacies p on p.id=q.pharmacy_id where o.id=p_order_id and p.owner_id=v_user and p.verification_status='approved' and p.is_active=true for update of o;
  if not found then raise exception 'Accepted order not found for this pharmacy'; end if;
  select * into v_delivery from public.deliveries where order_id=p_order_id for update;
  if not found then raise exception 'Delivery record not found'; end if;
  if (v_delivery.status='pending' and p_status <> 'preparing')
     or (v_delivery.status='preparing' and p_status not in ('out_for_delivery','cancelled'))
     or (v_delivery.status='out_for_delivery' and p_status not in ('delivered','delivery_failed'))
     or (v_delivery.status='failed' and p_status <> 'preparing') then
    raise exception 'Invalid delivery state transition';
  end if;
  v_next := case p_status when 'preparing' then 'preparing'::public.order_status when 'out_for_delivery' then 'out_for_delivery'::public.order_status when 'delivered' then 'delivered'::public.order_status else 'delivery_failed'::public.order_status end;
  update public.deliveries set status=p_status, delivery_note=left(coalesce(p_note,''),500), delivered_at=case when p_status='delivered' then now() else null end, updated_at=now() where order_id=p_order_id;
  update public.orders set status=v_next, updated_at=now() where id=p_order_id;
  insert into public.order_status_events(order_id, changed_by, old_status, new_status, note) values(p_order_id,v_user,v_order.status,v_next,left(coalesce(p_note,''),500));
  return jsonb_build_object('order_id',p_order_id,'status',v_next);
end;
$$;
revoke all on function public.update_pharmacy_delivery(uuid,text,text) from public;
grant execute on function public.update_pharmacy_delivery(uuid,text,text) to authenticated;

-- Approved pharmacies can discover only open requests in their registered district.
create policy "approved_pharmacies_read_open_district_requests" on public.orders for select to authenticated
using (
  status in ('requested','under_review','quoted')
  and exists(select 1 from public.pharmacies p where p.owner_id=(select auth.uid()) and p.district=orders.district and p.verification_status='approved' and p.is_active=true)
);

-- Preserve optional phone supplied during account creation while keeping all new accounts as patients.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles(id,full_name,phone,role)
  values(new.id, coalesce(new.raw_user_meta_data ->> 'full_name',''), nullif(new.raw_user_meta_data ->> 'phone',''), 'patient')
  on conflict (id) do update set
    full_name = excluded.full_name,
    phone = coalesce(excluded.phone, public.profiles.phone);
  return new;
end;
$$;

create policy "admin_update_profiles" on public.profiles for update to authenticated
using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');
create policy "admin_insert_audit_logs" on public.audit_logs for insert to authenticated with check (public.current_app_role() = 'admin');
alter table public.orders add column if not exists patient_name text;

create unique index if not exists pharmacy_quotes_one_per_pharmacy_order on public.pharmacy_quotes(order_id, pharmacy_id);

create or replace function public.create_patient_request(
  p_region text,
  p_district text,
  p_village_name text,
  p_medicine_name text,
  p_strength text,
  p_dosage_form text,
  p_quantity integer,
  p_landmark text,
  p_delivery_address text,
  p_patient_phone text,
  p_patient_name text,
  p_patient_note text default ''
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_profile public.profiles%rowtype;
  v_village public.villages%rowtype;
  v_order public.orders%rowtype;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  select * into v_profile from public.profiles where id=v_user;
  if not found or v_profile.role <> 'patient' then raise exception 'Patient account required'; end if;
  if p_region not in ('Jammu','Kashmir') or length(trim(coalesce(p_district,''))) not between 1 and 100 or length(trim(coalesce(p_village_name,''))) not between 1 and 120 then raise exception 'Invalid location'; end if;
  if length(trim(coalesce(p_medicine_name,''))) not between 1 and 160 or p_quantity not between 1 and 100 then raise exception 'Invalid medicine details'; end if;
  if length(trim(coalesce(p_delivery_address,''))) not between 3 and 500 or length(trim(coalesce(p_patient_phone,''))) not between 5 and 30 then raise exception 'Invalid delivery contact details'; end if;
  select * into v_village from public.villages where region=p_region and district=trim(p_district) and name=trim(p_village_name);
  if not found then raise exception 'Village not found in RuralMed location directory'; end if;
  insert into public.orders(patient_id,patient_name,patient_phone,village_id,region,district,village_name,landmark,delivery_address,patient_note,status)
  values(v_user,left(trim(coalesce(p_patient_name,v_profile.full_name,'')),120),trim(p_patient_phone),v_village.id,p_region,trim(p_district),trim(p_village_name),nullif(left(trim(coalesce(p_landmark,'')),240),''),trim(p_delivery_address),nullif(left(trim(coalesce(p_patient_note,'')),1000),''),'requested')
  returning * into v_order;
  insert into public.order_items(order_id,medicine_name,strength,dosage_form,quantity)
  values(v_order.id,trim(p_medicine_name),nullif(left(trim(coalesce(p_strength,'')),80),''),nullif(left(trim(coalesce(p_dosage_form,'')),60),''),p_quantity);
  insert into public.order_status_events(order_id,changed_by,old_status,new_status,note)
  values(v_order.id,v_user,null,'requested','Patient submitted a medicine request');
  return jsonb_build_object('id',v_order.id,'status',v_order.status,'created_at',v_order.created_at);
end;
$$;
revoke all on function public.create_patient_request(text,text,text,text,text,text,integer,text,text,text,text,text) from public;
grant execute on function public.create_patient_request(text,text,text,text,text,text,integer,text,text,text,text,text) to authenticated;

-- Avoid recursive RLS evaluation when policies need to inspect the current user's own role.
create or replace function public.current_app_role()
returns public.app_role
language sql stable security definer set search_path = ''
as $$ select p.role from public.profiles p where p.id = auth.uid() $$;
revoke all on function public.current_app_role() from public;
grant execute on function public.current_app_role() to authenticated;
