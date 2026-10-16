import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { orderStatusSchema } from '@/lib/validation';

export async function GET() {
  let supabase;
  try { supabase = await createClient(); }
  catch { return NextResponse.json({ error: 'Backend not configured' }, { status: 503 }); }
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const { data, error } = await supabase.from('orders')
    .select('id,region,district,village_name,status,created_at,delivery_address,patient_note,patient_phone,patient_name,order_items(id,medicine_name,strength,dosage_form,quantity),pharmacy_quotes(id,medicine_subtotal,delivery_fee,total_amount,quote_note,created_at,pharmacy_id,availability_confirmed,prescription_reviewed)')
    .eq('patient_id', user.id).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: 'Could not load requests' }, { status: 500 });
  return NextResponse.json({ orders: data ?? [] });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = orderStatusSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid order action', details: parsed.error.flatten() }, { status: 400 });
  let supabase;
  try { supabase = await createClient(); }
  catch { return NextResponse.json({ error: 'Backend not configured' }, { status: 503 }); }
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const input = parsed.data;
  if (input.action === 'accept_quote') {
    if (!input.quoteId) return NextResponse.json({ error: 'quoteId is required' }, { status: 400 });
    const { data, error } = await supabase.rpc('accept_pharmacy_quote', { p_order_id: input.orderId, p_quote_id: input.quoteId });
    if (error) return NextResponse.json({ error: 'Quote could not be accepted', message: error.message }, { status: 403 });
    return NextResponse.json({ result: data });
  }
  if (!input.status) return NextResponse.json({ error: 'status is required' }, { status: 400 });
  const { data, error } = await supabase.rpc('update_pharmacy_delivery', { p_order_id: input.orderId, p_status: input.status, p_note: input.note });
  if (error) return NextResponse.json({ error: 'Delivery status could not be updated', message: error.message }, { status: 403 });
  return NextResponse.json({ result: data });
}
