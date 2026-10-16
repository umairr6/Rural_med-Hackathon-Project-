'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function signInAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) redirect('/auth/login?error=missing');
  let outcome: 'ok' | 'credentials' | 'configuration' = 'ok';
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) outcome = 'credentials';
  } catch { outcome = 'configuration'; }
  if (outcome !== 'ok') redirect(`/auth/login?error=${outcome}`);
  redirect('/orders');
}

export async function signUpAction(formData: FormData) {
  const fullName = String(formData.get('fullName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const phone = String(formData.get('phone') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (fullName.length < 2 || !email || phone.length < 5 || password.length < 10) redirect('/auth/register?error=validation');
  let outcome: 'ok' | 'signup' | 'configuration' = 'ok';
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: fullName, phone },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback?next=/orders`,
      },
    });
    if (error) outcome = 'signup';
  } catch { outcome = 'configuration'; }
  if (outcome !== 'ok') redirect(`/auth/register?error=${outcome}`);
  redirect('/auth/register?success=check-email');
}

export async function signOutAction() {
  try { const supabase = await createClient(); await supabase.auth.signOut(); } catch { /* route still returns to public home */ }
  redirect('/');
}
