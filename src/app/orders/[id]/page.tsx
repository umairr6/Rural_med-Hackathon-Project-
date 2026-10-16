'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getDemoRequest } from '@/services/request.service';
import type { DemoRequest } from '@/types/request';
import { listDemoQuotes, acceptDemoQuote } from '@/services/quote.service';
import type { DemoQuote } from '@/lib/demo-store';

const LIVE_BACKEND = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const displayStatus = (value:string) => value.split('_').map(word=>word.charAt(0).toUpperCase()+word.slice(1)).join(' ');
type QuoteView={id:string;medicinePrice:number;deliveryFee:number;note:string;accepted:boolean;availabilityConfirmed?:boolean;prescriptionReviewed?:boolean};
export default function OrderDetailPage(){
  const params=useParams<{id:string}>();const id=decodeURIComponent(params.id);
  const [item,setItem]=useState<DemoRequest|null>(null);const [quotes,setQuotes]=useState<QuoteView[]>([]);const [acceptedQuoteId,setAcceptedQuoteId]=useState<string|null>(null);const [error,setError]=useState('');const [loading,setLoading]=useState(true);const [signedIn,setSignedIn]=useState(true);const [savingQuote,setSavingQuote]=useState<string|null>(null);
  async function refresh(){
    setLoading(true);setError('');
    if(!LIVE_BACKEND){setItem(getDemoRequest(id));setQuotes(listDemoQuotes().filter(q=>q.requestId===id).map(q=>({...q,accepted:q.accepted})));setLoading(false);return;}
    try {const response=await fetch(`/api/orders/${encodeURIComponent(id)}`,{cache:'no-store'});const payload=await response.json();if(response.status===401){setSignedIn(false);setItem(null);return;}if(!response.ok)throw new Error(payload.error||'Could not load request.');const order=payload.order;const line=order.order_items?.[0]??{};setItem({id:order.id,region:order.region,district:order.district,village:order.village_name,medicine:line.medicine_name??'Medicine request',strength:line.strength??'',form:line.dosage_form??'',quantity:line.quantity??1,landmark:'',address:order.delivery_address??'',notes:order.patient_note??'',patientName:'',patientPhone:order.patient_phone??'',status:displayStatus(order.status),createdAt:order.created_at});setAcceptedQuoteId(order.accepted_quote_id);setQuotes((order.pharmacy_quotes??[]).map((q:any)=>({id:q.id,medicinePrice:Number(q.medicine_subtotal),deliveryFee:Number(q.delivery_fee),note:q.quote_note??'',accepted:q.id===order.accepted_quote_id,availabilityConfirmed:q.availability_confirmed,prescriptionReviewed:q.prescription_reviewed})));setSignedIn(true);}
    catch(e){setError(e instanceof Error?e.message:'Could not load request.');}
    finally{setLoading(false);}
  }
  useEffect(()=>{void refresh();},[id]);
  async function accept(idToAccept:string){
    if(!LIVE_BACKEND){acceptDemoQuote(idToAccept);await refresh();return;}
    setSavingQuote(idToAccept);setError('');
    try{const response=await fetch('/api/orders',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId:id,action:'accept_quote',quoteId:idToAccept})});const payload=await response.json();if(!response.ok)throw new Error(payload.message||payload.error||'Could not accept quote.');await refresh();}
    catch(e){setError(e instanceof Error?e.message:'Could not accept quote.');}
    finally{setSavingQuote(null);}
  }
  if(loading)return <main className="page-shell"><div className="container"><div className="empty-state">Loading request…</div></div></main>;
  if(!signedIn&&LIVE_BACKEND)return <main className="page-shell"><div className="container"><div className="empty-state">Sign in to view private request details. <Link className="page-link" href="/auth/login">Sign in →</Link></div></div></main>;
  if(!item)return <main className="page-shell"><div className="container"><div className="page-heading"><h1>Request details</h1></div>{error&&<div className="notice notice-warning">{error}</div>}<div className="empty-state">This request was not found. <Link className="page-link" href="/orders">Back to requests</Link></div></div></main>;
  return <main className="page-shell"><div className="container"><div className="page-heading"><span className="eyebrow">REQUEST DETAILS · {LIVE_BACKEND?'CONNECTED':'DEMO'}</span><h1>{item.medicine}</h1><p>{item.id} · {item.village}, {item.district}</p></div>{error&&<div className="notice notice-warning section-gap">{error}</div>}<section className="panel stack"><div className="action-row"><strong>Current status</strong><span className="status-badge">{item.status}</span></div><div className="grid-2"><div><span className="help-text">Medicine details</span><p>{item.medicine} {item.strength} · Quantity {item.quantity}</p></div><div><span className="help-text">Location</span><p>{item.village}, {item.district}, {item.region}</p></div><div><span className="help-text">Submitted</span><p>{new Date(item.createdAt).toLocaleString()}</p></div><div><span className="help-text">Delivery address</span><p>{item.address||'Not provided'}</p></div></div><div className="notice notice-warning">{LIVE_BACKEND?'A request is not a confirmed order until a quote is accepted. Availability and prescription eligibility must be confirmed by an authorized pharmacy.':'Demo data only. Do not use this prototype for real medical or personal data.'}</div></section><section className="panel section-gap"><h2>Pharmacy quotes</h2>{quotes.length?quotes.map(q=><div className="panel stack" key={q.id}><div className="action-row"><strong>Quote {q.id.slice(0,12)}</strong><span className="status-badge">{LIVE_BACKEND?'Pharmacy quote':'Illustrative demo'}</span></div><div className="quote-row"><span>Medicine price</span><strong>₹{q.medicinePrice.toFixed(2)}</strong></div><div className="quote-row"><span>Delivery fee</span><strong>₹{q.deliveryFee.toFixed(2)}</strong></div><div className="quote-row"><span>Total</span><strong>₹{(q.medicinePrice+q.deliveryFee).toFixed(2)}</strong></div>{q.note&&<p className="help-text">{q.note}</p>}{q.accepted||acceptedQuoteId===q.id?<p className="form-success">Quote accepted. The pharmacy must still complete fulfilment and delivery.</p>:<button className="button button-primary" disabled={Boolean(acceptedQuoteId)||savingQuote!==null} onClick={()=>void accept(q.id)}>{savingQuote===q.id?'Accepting…':LIVE_BACKEND?'Accept pharmacy quote':'Accept demo quote'}</button>}</div>):<div className="empty-state">No quote yet. An approved pharmacy must confirm availability, price and delivery before a quote appears.</div>}</section><div className="section-gap"><Link className="page-link" href="/orders">← Back to requests</Link></div></div></main>;
}
