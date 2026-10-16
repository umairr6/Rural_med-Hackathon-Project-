import type { RequestStatus } from "@/types/request";
export type Order = { id:string; patientId:string; pharmacyId:string|null; status:RequestStatus; createdAt:string; updatedAt:string };
