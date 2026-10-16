import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const applicationSchema = z.object({
  name: z.string().trim().min(2).max(160),
  owner: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(5).max(30),
  email: z.string().trim().email().max(254),
  district: z.string().trim().min(1).max(100),
  address: z.string().trim().min(5).max(400),
  villages: z.string().trim().min(1).max(1200),
  licence: z.string().trim().min(3).max(120),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid application', details: parsed.error.flatten() }, { status: 400 });
  let supabase;
  try { supabase = await createClient(); }
  catch { return NextResponse.json({ error: 'Backend not configured' }, { status: 503 }); }
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const { data: existing } = await supabase.from('pharmacies').select('id,verification_status').eq('owner_id', user.id).maybeSingle();
  if (existing) return NextResponse.json({ error: 'An application already exists for this account', status: existing.verification_status }, { status: 409 });
  const input = parsed.data;
  const { data, error } = await supabase.from('pharmacies').insert({
    owner_id: user.id,
    name: input.name,
    contact_name: input.owner,
    phone: input.phone,
    email: input.email,
    district: input.district,
    address: input.address,
    licence_number: input.licence,
    verification_status: 'pending',
    is_active: false,
    delivery_available: true,
  }).select('id,name,verification_status,is_active').single();
  if (error || !data) return NextResponse.json({ error: 'Application could not be saved', message: 'Check that the licence reference is unique and the database migration is applied.' }, { status: 400 });
  return NextResponse.json({ application: data, serviceAreasSubmitted: input.villages.split(',').map(v => v.trim()).filter(Boolean) }, { status: 201 });
}
