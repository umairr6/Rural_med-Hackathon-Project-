import Link from 'next/link';
import { signInAction } from '../actions';

type Props = { searchParams: Promise<{ error?: string }> };
export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const messages: Record<string,string> = {
    missing: 'Enter your email and password.',
    credentials: 'We could not sign you in with those details.',
    configuration: 'Authentication is not configured yet. Add the Supabase URL and anon key to .env.local.',
  };
  return <main className="page-shell"><div className="container" style={{maxWidth:560}}><div className="page-heading"><span className="eyebrow">PATIENT ACCOUNT</span><h1>Welcome back</h1><p>Sign in to access your private medicine requests and quotes.</p></div><form action={signInAction} className="panel stack"><div className="notice notice-warning">Use this live sign-in only after configuring Supabase. Demo mode records remain in this browser and are separate from your account.</div>{error && <p className="form-error" role="alert">{messages[error] ?? 'Sign-in failed. Please try again.'}</p>}<div className="field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={254}/></div><div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required/></div><button className="button button-primary" type="submit">Sign in securely</button><p className="help-text">New to RuralMed? <Link className="page-link" href="/auth/register">Create a patient account</Link>.</p><p className="help-text"><Link className="page-link" href="/auth/forgot-password">Forgot password?</Link> Password recovery must be configured before launch.</p></form></div></main>;
}
