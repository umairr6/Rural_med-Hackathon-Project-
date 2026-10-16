export type PharmacyStatus = "Pending Verification" | "Approved" | "Rejected" | "Suspended";
export type Pharmacy = { id:string; name:string; district:string; serviceableVillages:string[]; status:PharmacyStatus; licenceNumber:string };
