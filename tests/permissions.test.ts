import { describe, expect, it } from "vitest";
import { canUpdateOrderStatus } from "../src/lib/permissions";
describe("status permissions helper",()=>{it("does not let patients update delivery",()=>expect(canUpdateOrderStatus("patient","Delivered")).toBe(false));it("allows admin helper",()=>expect(canUpdateOrderStatus("admin","Delivered")).toBe(true));});
