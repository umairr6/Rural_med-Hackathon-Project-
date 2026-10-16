export type RequestStatus = "Requested" | "Under Review" | "Quoted" | "Accepted" | "Preparing" | "Out for Delivery" | "Delivered" | "Rejected" | "Cancelled" | "Delivery Failed";
export type NewDemoRequest = {
  region:string; district:string; village:string; medicine:string; strength:string; form:string;
  quantity:number; landmark:string; address:string; notes:string; patientName:string; patientPhone:string;
};
export type DemoRequest = NewDemoRequest & { id:string; status:RequestStatus|string; createdAt:string };
