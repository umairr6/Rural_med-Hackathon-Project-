import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { quoteSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid quote data', details: parsed.error.flatten() }, { status: 400 });
  let supabase;
  try { supabase = await createClient(); }
  catch { return NextResponse.json({ error: 'Backend not configured' }, { status: 503 }); }
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const input = parsed.data;
  const { data, error } = await supabase.rpc('submit_pharmacy_quote', {
    p_order_id: input.requestId,
    p_medicine_subtotal: input.medicinePrice,
    p_delivery_fee: input.deliveryFee,
    p_availability_confirmed: input.availabilityConfirmed,
    p_prescription_reviewed: input.prescriptionReviewed,
    p_quote_note: input.note,
  });
  if (error) return NextResponse.json({ error: 'Quote could not be submitted', message: error.message }, { status: 403 });
  return NextResponse.json({ quote: data }, { status: 201 });
}
