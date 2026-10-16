import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const actionSchema = z.object({ pharmacyId: z.string().uuid(), action: z.enum(['approve','reject','suspend','reactivate']) });
async function getAdminClient() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { supabase, user: null, forbidden: true };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  return { supabase, user, forbidden: profile?.role !== 'admin' };
}
export async function GET() {
  let auth;
  try { auth = await getAdminClient(); } catch { return NextResponse.json({ error: 'Backend not configured' }, { status: 503 }); }
  if (auth.forbidden || !auth.user) return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });
  const { data, error } = await auth.supabase.from('pharmacies').select('id,name,contact_name,phone,email,address,district,licence_number,verification_status,is_active,created_at,owner_id').order('created_at', { ascending: false }).limit(200);
  if (error) return NextResponse.json({ error: 'Could not load pharmacy applications' }, { status: 500 });
  return NextResponse.json({ pharmacies: data ?? [] });
}
export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid admin action' }, { status: 400 });
  let auth;
  try { auth = await getAdminClient(); } catch { return NextResponse.json({ error: 'Backend not configured' }, { status: 503 }); }
  if (auth.forbidden || !auth.user) return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });
  const { pharmacyId, action } = parsed.data;
  const state = action === 'approve' || action === 'reactivate' ? { verification_status: 'approved', is_active: true } : action === 'suspend' ? { verification_status: 'suspended', is_active: false } : { verification_status: 'rejected', is_active: false };
  const { data: pharmacy, error } = await auth.supabase.from('pharmacies').update(state).eq('id', pharmacyId).select('id,owner_id,verification_status,is_active').single();
  if (error || !pharmacy) return NextResponse.json({ error: 'Could not update pharmacy status' }, { status: 400 });
  if (action === 'approve' || action === 'reactivate') {
    const { error: roleError } = await auth.supabase.from('profiles').update({ role: 'pharmacy' }).eq('id', pharmacy.owner_id);
    if (roleError) return NextResponse.json({ error: 'Pharmacy approved but account role update failed', message: 'Review the profile role in Supabase before allowing access.' }, { status: 500 });
  }
  if (action === 'suspend' || action === 'reject') {
    await auth.supabase.from('profiles').update({ role: 'patient' }).eq('id', pharmacy.owner_id);
  }
  await auth.supabase.from('audit_logs').insert({ actor_id: auth.user.id, action: `pharmacy_${action}`, entity_type: 'pharmacy', entity_id: pharmacy.id, metadata: { verification_status: pharmacy.verification_status } });
  return NextResponse.json({ pharmacy });
}
