 "use client";
import { updateDemoStatus } from "@/services/order.service";
const transitions = ["Under Review","Preparing","Out for Delivery","Delivered","Delivery Failed","Rejected","Cancelled"];
export function DeliveryStatus({requestId,currentStatus,onUpdated}:{requestId:string;currentStatus:string;onUpdated:()=>void}) {
  return <div className="action-row"><label className="help-text" htmlFor={`status-${requestId}`}>Demo status</label><select id={`status-${requestId}`} className="input" defaultValue={currentStatus} onChange={e=>{updateDemoStatus(requestId,e.target.value);onUpdated();}}>{[...new Set([currentStatus,...transitions])].map(s=><option key={s}>{s}</option>)}</select></div>;
}
