'use client';
import { useState } from 'react';
import { updateDemoStatus } from '@/services/order.service';
const LIVE_BACKEND = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const transitions = ['Under Review','Preparing','Out for Delivery','Delivered','Delivery Failed','Rejected','Cancelled'];
const apiStatus:Record<string,string>={'Preparing':'preparing','Out for Delivery':'out_for_delivery','Delivered':'delivered','Delivery Failed':'delivery_failed'};
export function DeliveryStatus({requestId,currentStatus,onUpdated}:{requestId:string;currentStatus:string;onUpdated:()=>void}) {
  const [error,setError]=useState('');const [saving,setSaving]=useState(false);
  async function change(status:string){setError('');if(!LIVE_BACKEND){try{updateDemoStatus(requestId,status);onUpdated();}catch(e){setError(e instanceof Error?e.message:'Could not update demo status.');}return;}const next=apiStatus[status];if(!next){setError('That status cannot be changed from this screen.');return;}setSaving(true);try{const response=await fetch('/api/orders',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId:requestId,action:'update_delivery',status:next,note:''})});const payload=await response.json();if(!response.ok)throw new Error(payload.message||payload.error||'Status update failed.');onUpdated();}catch(e){setError(e instanceof Error?e.message:'Status update failed.');}finally{setSaving(false);}}
  const choices=LIVE_BACKEND?['Accepted','Preparing','Out for Delivery','Delivered','Delivery Failed']:[...new Set([currentStatus,...transitions])];
  return <div className="stack"><div className="action-row"><label className="help-text" htmlFor={`status-${requestId}`}>{LIVE_BACKEND?'Delivery status':'Demo status'}</label><select id={`status-${requestId}`} className="input" value={currentStatus} disabled={saving} onChange={e=>void change(e.target.value)}>{[...new Set([currentStatus,...choices])].map(s=><option key={s}>{s}</option>)}</select></div>{error&&<span className="form-error" role="alert">{error}</span>}</div>;
}
