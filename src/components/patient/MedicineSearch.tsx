 "use client";
import { useState } from "react";
import { Search } from "lucide-react";
export function MedicineSearch({ onSearch }: { onSearch: (term:string)=>void }) {
  const [term,setTerm]=useState("");
  return <form className="action-row" onSubmit={e=>{e.preventDefault();onSearch(term.trim());}}>
    <div className="field" style={{flex:"1 1 240px"}}><label htmlFor="medicine-search">Medicine name (optional)</label><input id="medicine-search" value={term} onChange={e=>setTerm(e.target.value)} placeholder="Enter medicine name or generic name"/></div>
    <button className="button button-primary" type="submit"><Search size={16}/> Search demo catalogue</button>
  </form>;
}
