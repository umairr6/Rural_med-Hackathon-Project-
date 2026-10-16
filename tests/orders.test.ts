import { describe, expect, it } from "vitest";
import { canMoveDelivery } from "../src/services/delivery.service";
describe("demo delivery transitions",()=>{it("allows preparing to out for delivery",()=>expect(canMoveDelivery("Preparing","Out for Delivery")).toBe(true));it("rejects jumping from accepted directly to delivered",()=>expect(canMoveDelivery("Accepted","Delivered")).toBe(false));});
