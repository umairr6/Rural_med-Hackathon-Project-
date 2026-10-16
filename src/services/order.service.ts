import { readRequests, writeRequests } from "@/lib/demo-store";
const allowed = new Set(["Under Review","Preparing","Out for Delivery","Delivered","Delivery Failed","Rejected","Cancelled"]);
export function updateDemoStatus(id:string,status:string) {
  if(!allowed.has(status)) throw new Error("Unsupported demo status.");
  writeRequests(readRequests().map(r=>r.id===id?{...r,status}:r));
}
export function listDemoOrders(){return readRequests();}
