import { signOutAction } from '@/app/auth/actions';
export function SignOutButton(){return <form action={signOutAction}><button className="button button-secondary" type="submit">Sign out</button></form>}
