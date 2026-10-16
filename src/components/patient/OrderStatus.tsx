import type { DemoRequest } from "@/types/request";
const states = ["Requested","Under Review","Quoted","Accepted","Preparing","Out for Delivery","Delivered"];
export function OrderStatus({request}:{request:DemoRequest}) {
  const index=states.indexOf(request.status);
  return <div className="stack"><div className="action-row"><strong>{request.medicine}</strong><span className={`status-badge ${request.status==="Rejected"||request.status==="Cancelled"?"danger":request.status==="Requested"?"pending":""}`}>{request.status}</span></div><p className="help-text">{request.village}, {request.district} · Request {request.id}</p><div className="status-line">{request.status==="Requested"?"Your request has been saved.":`Current status: ${request.status}`}</div>{index>=0&&<div className="action-row">{states.map((s,i)=><span key={s} className={`status-badge ${i<=index?"":"neutral"}`}>{s}</span>)}</div>}<p className="help-text">A request is not a confirmed order until an authorized pharmacy confirms availability and a quote is accepted.</p></div>;
}
