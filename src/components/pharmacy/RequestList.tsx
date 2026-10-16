import type { DemoRequest } from "@/types/request";
export function RequestList({requests,onQuote}:{requests:DemoRequest[];onQuote:(id:string)=>void}) {
  if(!requests.length) return <div className="empty-state">No demo requests yet. Submit a request from the patient form to populate this list.</div>;
  return <div className="table-wrap"><table className="data-table"><thead><tr><th>Request</th><th>Location</th><th>Status</th><th>Action</th></tr></thead><tbody>{requests.map(r=><tr key={r.id}><td><strong>{r.medicine}</strong><br/><span className="help-text">{r.strength||"Strength not provided"} · Qty {r.quantity}</span></td><td>{r.village}<br/><span className="help-text">{r.district}, {r.region}</span></td><td><span className="status-badge pending">{r.status}</span></td><td><button className="button button-secondary" onClick={()=>onQuote(r.id)}>Prepare quote</button></td></tr>)}</tbody></table></div>;
}
