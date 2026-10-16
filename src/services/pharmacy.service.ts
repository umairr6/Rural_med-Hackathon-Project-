export type PharmacyApplication = { name:string; owner:string; phone:string; email:string; district:string; villages:string; licence:string };
export function validatePharmacyApplication(data:PharmacyApplication) {
  const required: (keyof PharmacyApplication)[]=["name","owner","phone","email","district","villages","licence"];
  const missing=required.filter(k=>!String(data[k]??"").trim());
  return { valid:missing.length===0, missing };
}
// Production implementation must store applications server-side and verify licences before allowing fulfilment.
