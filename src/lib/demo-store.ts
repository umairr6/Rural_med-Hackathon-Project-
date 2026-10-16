import type { DemoRequest } from "@/types/request";
export type DemoQuote = { id:string; requestId:string; medicinePrice:number; deliveryFee:number; note:string; createdAt:string; accepted:boolean };
const REQUESTS = "ruralmed.demo.requests.v1";
const QUOTES = "ruralmed.demo.quotes.v1";
const isBrowser = () => typeof window !== "undefined";
export function readRequests(): DemoRequest[] {
  if(!isBrowser()) return [];
  try { return JSON.parse(localStorage.getItem(REQUESTS) || "[]") as DemoRequest[]; } catch { return []; }
}
export function writeRequests(items:DemoRequest[]) { if(isBrowser()) localStorage.setItem(REQUESTS,JSON.stringify(items)); }
export function readQuotes():DemoQuote[] {
  if(!isBrowser()) return [];
  try { return JSON.parse(localStorage.getItem(QUOTES) || "[]") as DemoQuote[]; } catch { return []; }
}
export function writeQuotes(items:DemoQuote[]) { if(isBrowser()) localStorage.setItem(QUOTES,JSON.stringify(items)); }
export function clearDemoData() { if(isBrowser()){localStorage.removeItem(REQUESTS);localStorage.removeItem(QUOTES);} }
