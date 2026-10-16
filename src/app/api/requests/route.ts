import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { medicineRequestSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = medicineRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request data', details: parsed.error.flatten() }, { status: 400 });

  let supabase;
  try { supabase = await createClient(); }
  catch { return NextResponse.json({ error: 'Backend not configured', message: 'Add Supabase project settings to .env.local.' }, { status: 503 }); }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Authentication required', message: 'Sign in before submitting a live request.' }, { status: 401 });
  const { data: profile, error: profileError } = await supabase.from('profiles').select('id,role').eq('id', user.id).maybeSingle();
  if (profileError || !profile || profile.role !== 'patient') return NextResponse.json({ error: 'Patient account required' }, { status: 403 });

  const input = parsed.data;
  const { data, error } = await supabase.rpc('create_patient_request', {
    p_region: input.region,
    p_district: input.district,
    p_village_name: input.village,
    p_medicine_name: input.medicine,
    p_strength: input.strength,
    p_dosage_form: input.form,
    p_quantity: input.quantity,
    p_landmark: input.landmark,
    p_delivery_address: input.address,
    p_patient_phone: input.patientPhone,
    p_patient_name: input.patientName || String(user.user_metadata?.full_name ?? ''),
    p_patient_note: input.notes,
  });
  if (error || !data) return NextResponse.json({ error: 'Could not create request', message: error?.message ?? 'Database did not return a request.' }, { status: 400 });
  return NextResponse.json({ id: data.id, status: data.status, createdAt: data.created_at }, { status: 201 });
}

export async function GET() {
  let supabase;
  try { supabase = await createClient(); }
  catch { return NextResponse.json({ error: 'Backend not configured' }, { status: 503 }); }
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role === 'admin') {
    const { data, error } = await supabase.from('orders').select('id,region,district,village_name,status,created_at,delivery_address,order_items(id,medicine_name,strength,dosage_form,quantity)').order('created_at', { ascending: false }).limit(200);
    if (error) return NextResponse.json({ error: 'Could not load requests' }, { status: 500 });
    return NextResponse.json({ requests: data ?? [], mode: 'admin' });
  }
  const { data: pharmacy } = await supabase.from('pharmacies').select('id,district,verification_status,is_active').eq('owner_id', user.id).maybeSingle();
  if (pharmacy?.verification_status === 'approved' && pharmacy.is_active) {
    const { data: openOrders, error: openError } = await supabase.from('orders').select('id,region,district,village_name,status,created_at,delivery_address,patient_note,patient_name,order_items(id,medicine_name,strength,dosage_form,quantity),pharmacy_quotes(id,pharmacy_id)').eq('district', pharmacy.district).in('status', ['requested','under_review','quoted']).order('created_at', { ascending: false }).limit(100);
    if (openError) return NextResponse.json({ error: 'Could not load requests' }, { status: 500 });
    const { data: acceptedOrders, error: acceptedError } = await supabase.from('orders').select('id,region,district,village_name,status,created_at,delivery_address,patient_note,patient_name,order_items(id,medicine_name,strength,dosage_form,quantity),pharmacy_quotes!inner(id,pharmacy_id)').eq('pharmacy_quotes.pharmacy_id', pharmacy.id).not('accepted_quote_id', 'is', null).in('status', ['accepted','preparing','out_for_delivery','delivered','delivery_failed']).order('created_at', { ascending: false }).limit(100);
    if (acceptedError) return NextResponse.json({ error: 'Could not load assigned deliveries' }, { status: 500 });
    const availableToQuote = (openOrders ?? []).filter(order => !((order as any).pharmacy_quotes ?? []).some((quote: any) => quote.pharmacy_id === pharmacy.id));
    const unique = new Map([...availableToQuote, ...(acceptedOrders ?? [])].map(order => [order.id, order]));
    return NextResponse.json({ requests: [...unique.values()], mode: 'pharmacy' });
  }
  if (profile?.role === 'patient') {
    const { data, error } = await supabase.from('orders').select('id,region,district,village_name,status,created_at,delivery_address,order_items(id,medicine_name,strength,dosage_form,quantity),pharmacy_quotes(id,medicine_subtotal,delivery_fee,total_amount,quote_note,created_at,pharmacy_id,availability_confirmed,prescription_reviewed)').eq('patient_id', user.id).order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: 'Could not load requests' }, { status: 500 });
    return NextResponse.json({ requests: data ?? [], mode: 'patient' });
  }
  return NextResponse.json({ error: 'No approved pharmacy account or valid user role was found.' }, { status: 403 });
}
