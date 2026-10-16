export const DELIVERY_STATES = ["Preparing","Out for Delivery","Delivered","Delivery Failed"] as const;
export type DeliveryState = typeof DELIVERY_STATES[number];
// Demo-only state helpers. In production, transitions must be authorized and checked server-side.
export function canMoveDelivery(from:string,to:DeliveryState) {
  const transitions:Record<string,string[]> = {
    Accepted:["Preparing","Cancelled"],
    Preparing:["Out for Delivery","Cancelled"],
    "Out for Delivery":["Delivered","Delivery Failed"],
    "Delivery Failed":["Preparing","Cancelled"],
  };
  return (transitions[from]??[]).includes(to);
}
