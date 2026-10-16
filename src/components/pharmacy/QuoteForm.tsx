 "use client";
import { useState } from "react";
import { addDemoQuote } from "@/services/quote.service";
export function QuoteForm({requestId,onDone}:{requestId:string;onDone:()=>void}) {
  const [price,setPrice]=useState("");const [delivery,setDelivery]=useState("");const [note,setNote]=useState("");const [error,setError]=useState("");
  return <form className="panel stack" onSubmit={e=>{e.preventDefault();const p=Number(price),d=Number(delivery);if(price===""||delivery===""||p<0||d<0||!Number.isFinite(p)||!Number.isFinite(d)){setError("Enter valid non-negative quote amounts.");return;}addDemoQuote({requestId,medicinePrice:p,deliveryFee:d,note});onDone();}}>
    <div className="notice notice-warning">Demo quote only. This does not confirm inventory or create a real order.</div><h3>Quote for {requestId}</h3>
    <div className="grid-2"><div className="field"><label htmlFor="medicine-price">Medicine price (₹)</label><input id="medicine-price" required type="number" min="0" step="0.01" value={price} onChange={e=>setPrice(e.target.value)}/></div><div className="field"><label htmlFor="delivery-fee">Delivery fee (₹)</label><input id="delivery-fee" required type="number" min="0" step="0.01" value={delivery} onChange={e=>setDelivery(e.target.value)}/></div></div>
    <div className="field"><label htmlFor="quote-note">Pharmacy note</label><textarea id="quote-note" value={note} onChange={e=>setNote(e.target.value)} placeholder="Availability and conditions to confirm"/></div>
    {error&&<p className="form-error">{error}</p>}<div className="action-row"><button className="button button-primary" type="submit">Save demo quote</button><button className="button button-secondary" type="button" onClick={onDone}>Cancel</button></div>
  </form>;
}
