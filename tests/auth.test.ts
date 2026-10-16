import { describe, expect, it } from "vitest";
import { canAccessRole } from "../src/lib/permissions";
describe("role access helper",()=>{it("allows matching role",()=>expect(canAccessRole("pharmacy",["pharmacy"])).toBe(true));it("denies mismatched role",()=>expect(canAccessRole("patient",["admin"])).toBe(false));it("denies undefined role",()=>expect(canAccessRole(undefined,["patient"])).toBe(false));});
