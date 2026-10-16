import { readQuotes, writeQuotes, readRequests, writeRequests } from "@/lib/demo-store";
import type { DemoQuote } from "@/lib/demo-store";
export function addDemoQuote(input:Omit<DemoQuote,"id"|"createdAt"|"accepted">):DemoQuote {
  const quote:DemoQuote={...input,id:`Q-${Date.now().toString(36).toUpperCase()}`,createdAt:new Date().toISOString(),accepted:false};
  writeQuotes([quote,...readQuotes()]);
  writeRequests(readRequests().map(r=>r.id===input.requestId?{...r,status:"Quoted"}:r));
  return quote;
}
export function listDemoQuotes(){return readQuotes();}
export function acceptDemoQuote(id:string){const quotes=readQuotes();const quote=quotes.find(q=>q.id===id);if(!quote)return false;writeQuotes(quotes.map(q=>({...q,accepted:q.id===id})));writeRequests(readRequests().map(r=>r.id===quote.requestId?{...r,status:"Accepted"}:r));return true;}
