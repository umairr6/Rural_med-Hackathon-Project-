import { readRequests, writeRequests } from "@/lib/demo-store";
import type { DemoRequest, NewDemoRequest } from "@/types/request";
export function createDemoRequest(input:NewDemoRequest):DemoRequest {
  const record:DemoRequest={...input,id:`RM-${Date.now().toString(36).toUpperCase()}`,status:"Requested",createdAt:new Date().toISOString()};
  const items=readRequests();writeRequests([record,...items]);return record;
}
export function listDemoRequests(){return readRequests();}
export function getDemoRequest(id:string){return readRequests().find(r=>r.id===id)??null;}
