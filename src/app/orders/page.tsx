'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listDemoRequests } from '@/services/request.service';
import type { DemoRequest } from '@/types/request';
import { OrderStatus } from '@/components/patient/OrderStatus';
import { SignOutButton } from '@/components/auth/SignOutButton';

const LIVE_BACKEND = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const displayStatus = (value:string) => value.split('_').map(word=>word.charAt(0).toUpperCase()+word.slice(1)).join(' ');
function mapLiveOrder(order:any):DemoRequest {
  const item=order.order_items?.[0] ?? {};
  return { id:order.id, region:order.region, district:order.district, village:order.village_name, medicine:item.medicine_name ?? 'Medicine request', strength:item.strength ?? '', form:item.dosage_form ?? '', quantity:item.quantity ?? 1, landmark:'', address:order.delivery_address ?? '', notes:order.patient_note ?? '', patientName:'', patientPhone:order.patient_phone ?? '', status:displayStatus(order.status), createdAt:order.created_at };
}
export default function OrdersPage(){
  const [items,setItems]=useState<DemoRequest[]>([]);const [error,setError]=useState('');const [loading,setLoading]=useState(true);const [signedIn,setSignedIn]=useState(false);
  async function refresh(){
    setLoading(true);setError('');
    if(!LIVE_BACKEND){setItems(listDemoRequests());setLoading(false);return;}
    try {const response=await fetch('/api/orders',{cache:'no-store'});const payload=await response.json();if(response.status===401){setSignedIn(false);setItems([]);return;}if(!response.ok)throw new Error(payload.message||payload.error||'Could not load orders.');setSignedIn(true);setItems((payload.orders??[]).map(mapLiveOrder));}
    catch(e){setError(e instanceof Error?e.message:'Could not load orders.');}
    finally{setLoading(false);}
  }
  useEffect(()=>{void refresh();},[]);
  return <main className="page-shell"><div className="container"><div className="page-heading"><span className="eyebrow">PATIENT DASHBOARD · {LIVE_BACKEND?'CONNECTED MODE':'DEMO MODE'}</span><h1>Your medicine requests</h1><p>{LIVE_BACKEND?'Requests saved to your authenticated account. Quotes and availability still require pharmacy confirmation.':'Requests saved in this browser only. This is a demonstration, not an authenticated account or real order tracking.'}</p></div><div className="action-row" style={{marginBottom:18}}><Link className="button button-primary" href="/request-medicine">New request</Link><button className="button button-secondary" onClick={()=>void refresh()} disabled={loading}>Refresh list</button>{LIVE_BACKEND&&!signedIn&&<Link className="button button-secondary" href="/auth/login">Sign in</Link>}{LIVE_BACKEND&&signedIn&&<SignOutButton />}</div>{error&&<div className="notice notice-warning">{error}</div>}{LIVE_BACKEND&&!signedIn&&!loading?<div className="empty-state">Sign in to view private requests. <br/><Link className="page-link" href="/auth/login">Sign in securely →</Link></div>:loading?<div className="empty-state">Loading requests…</div>:items.length?<div className="stack">{items.map(r=><section className="panel" key={r.id}><OrderStatus request={r}/><div className="section-gap"><Link className="page-link" href={`/orders/${encodeURIComponent(r.id)}`}>View request details →</Link></div></section>)}</div>:<div className="empty-state">No requests found yet.<br/><Link className="page-link" href="/request-medicine">Create a request →</Link></div>}</div></main>
}
