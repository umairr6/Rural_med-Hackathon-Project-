export type Role = "patient" | "pharmacy" | "admin";
export function canAccessRole(userRole:Role|undefined,allowed:Role[]) {
  return Boolean(userRole && allowed.includes(userRole));
}
export function canUpdateOrderStatus(role:Role,status:string) {
  if(role==="admin") return true;
  if(role!=="pharmacy") return false;
  return ["Under Review","Preparing","Out for Delivery","Delivered","Delivery Failed","Rejected"].includes(status);
}
// UI helpers are not security boundaries. Repeat every permission check in trusted server code and database RLS.
