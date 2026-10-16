type Props = { region: string; district: string; village: string; onRegion: (v:string)=>void; onDistrict:(v:string)=>void; onVillage:(v:string)=>void };
const districts: Record<string,string[]> = {
  Kashmir: ["Baramulla","Srinagar","Kupwara","Bandipora","Ganderbal","Budgam","Anantnag","Pulwama","Shopian","Kulgam"],
  Jammu: ["Jammu","Doda","Kishtwar","Rajouri","Poonch","Kathua","Samba","Udhampur","Reasi","Ramban"],
};
const villages: Record<string,string[]> = {
  Baramulla:["Sopore","Pattan","Uri","Baramulla town","Rafiabad"],
  Srinagar:["Srinagar city","Harwan","Zakura"],
  Kupwara:["Kupwara town","Handwara","Langate"],
  Jammu:["Jammu city","Akhnoor","R S Pura"],
  Doda:["Doda town","Bhaderwah"],
};
export function VillageSelector({region,district,village,onRegion,onDistrict,onVillage}:Props) {
  const ds = districts[region] ?? [];
  const vs = villages[district] ?? [`${district || "Select district"} - other village`];
  return <div className="grid-3">
    <div className="field"><label htmlFor="region">Region *</label><select id="region" required value={region} onChange={e=>{onRegion(e.target.value);onDistrict("");onVillage("");}}><option value="">Select region</option><option>Kashmir</option><option>Jammu</option></select></div>
    <div className="field"><label htmlFor="district">District *</label><select id="district" required value={district} disabled={!region} onChange={e=>{onDistrict(e.target.value);onVillage("");}}><option value="">Select district</option>{ds.map(d=><option key={d}>{d}</option>)}</select></div>
    <div className="field"><label htmlFor="village">Village / town *</label><select id="village" required value={village} disabled={!district} onChange={e=>onVillage(e.target.value)}><option value="">Select village</option>{vs.map(v=><option key={v}>{v}</option>)}</select></div>
  </div>;
}
