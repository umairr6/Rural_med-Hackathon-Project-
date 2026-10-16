 "use client";
import { useState } from "react";
import { VillageSelector } from "./VillageSelector";
import { createDemoRequest } from "@/services/request.service";
import type { DemoRequest } from "@/types/request";

export function MedicineRequestForm() {
  const [region,setRegion]=useState(""); const [district,setDistrict]=useState(""); const [village,setVillage]=useState("");
  const [medicine,setMedicine]=useState(""); const [strength,setStrength]=useState(""); const [form,setForm]=useState(""); const [quantity,setQuantity]=useState("1");
  const [landmark,setLandmark]=useState(""); const [address,setAddress]=useState(""); const [notes,setNotes]=useState(""); const [name,setName]=useState(""); const [phone,setPhone]=useState("");
  const [result,setResult]=useState<DemoRequest|null>(null); const [error,setError]=useState("");
  function submit(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault();setError("");
    if(!region||!district||!village||!medicine.trim()||!name.trim()||!phone.trim()){setError("Complete all required fields before submitting.");return;}
    const record=createDemoRequest({region,district,village,medicine:medicine.trim(),strength:strength.trim(),form,quantity:Number(quantity),landmark:landmark.trim(),address:address.trim(),notes:notes.trim(),patientName:name.trim(),patientPhone:phone.trim()});
    setResult(record);
  }
  if(result) return <div className="panel stack"><div className="notice"><strong>Demo request saved.</strong> This record is stored only in this browser and is not sent to a pharmacy.</div><h2>Request reference: {result.id}</h2><p className="help-text">Status: <strong>{result.status}</strong>. No pharmacy quote or medicine availability has been confirmed.</p><div className="action-row"><a className="button button-primary" href="/orders">View requests</a><button className="button button-secondary" onClick={()=>setResult(null)}>Submit another</button></div></div>;
  return <form className="panel stack" onSubmit={submit}>
    <div className="notice notice-warning"><strong>Prototype mode:</strong> use fictional contact details only. Do not enter real patient information or upload prescriptions in this demo. This form does not submit to a real pharmacy.</div>
    <h2>Where do you need the medicine?</h2>
    <VillageSelector region={region} district={district} village={village} onRegion={setRegion} onDistrict={setDistrict} onVillage={setVillage}/>
    <div className="grid-2">
      <div className="field"><label htmlFor="landmark">Landmark</label><input id="landmark" value={landmark} onChange={e=>setLandmark(e.target.value)} placeholder="Near a known place"/></div>
      <div className="field"><label htmlFor="address">Delivery address (demo only)</label><input id="address" value={address} onChange={e=>setAddress(e.target.value)} placeholder="General area only"/></div>
    </div>
    <div className="divider"/>
    <h2>Medicine details</h2>
    <div className="grid-2">
      <div className="field"><label htmlFor="medicine">Medicine name *</label><input id="medicine" required value={medicine} onChange={e=>setMedicine(e.target.value)} placeholder="Name as written by clinician"/></div>
      <div className="field"><label htmlFor="strength">Strength (if known)</label><input id="strength" value={strength} onChange={e=>setStrength(e.target.value)} placeholder="e.g. strength on package"/></div>
      <div className="field"><label htmlFor="form">Dosage form (if known)</label><select id="form" value={form} onChange={e=>setForm(e.target.value)}><option value="">Select form</option><option>Tablet</option><option>Capsule</option><option>Syrup</option><option>Cream</option><option>Inhaler</option><option>Other / unsure</option></select></div>
      <div className="field"><label htmlFor="quantity">Quantity requested *</label><input id="quantity" type="number" min="1" max="100" required value={quantity} onChange={e=>setQuantity(e.target.value)}/><small>The pharmacy will review appropriateness and applicable limits.</small></div>
    </div>
    <div className="field"><label htmlFor="notes">Additional information (optional)</label><textarea id="notes" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Non-sensitive note for the pharmacy. Do not include medical history in demo mode."/></div>
    <div className="divider"/>
    <h2>Contact details (demo only)</h2>
    <div className="grid-2">
      <div className="field"><label htmlFor="patientName">Name *</label><input id="patientName" required value={name} onChange={e=>setName(e.target.value)} placeholder="Demo name"/></div>
      <div className="field"><label htmlFor="patientPhone">Phone *</label><input id="patientPhone" required value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Fictional number" inputMode="tel"/></div>
    </div>
    {error&&<p className="form-error" role="alert">{error}</p>}
    <button className="button button-primary" type="submit">Save demo request</button>
    <p className="help-text">Requests are not orders. Prescription medicines require legally compliant review by authorized pharmacy personnel.</p>
  </form>;
}
