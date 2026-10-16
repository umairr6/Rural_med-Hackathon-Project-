import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  let supabase;
  try { supabase = await createClient(); }
  catch { return NextResponse.json({ error: 'Backend not configured' }, { status: 503 }); }
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const { id } = await context.params;
  const { data, error } = await supabase.from('orders').select('id,region,district,village_name,status,created_at,delivery_address,patient_note,patient_phone,patient_name,accepted_quote_id,order_items(id,medicine_name,strength,dosage_form,quantity),pharmacy_quotes(id,medicine_subtotal,delivery_fee,total_amount,quote_note,created_at,pharmacy_id,availability_confirmed,prescription_reviewed)').eq('id', id).eq('patient_id', user.id).maybeSingle();
  if (error) return NextResponse.json({ error: 'Could not load request' }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  return NextResponse.json({ order: data });
}
