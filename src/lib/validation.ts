import { z } from "zod";
export const medicineRequestSchema = z.object({
  region: z.enum(["Jammu","Kashmir"]),
  district: z.string().trim().min(1).max(100),
  village: z.string().trim().min(1).max(120),
  medicine: z.string().trim().min(1).max(160),
  strength: z.string().trim().max(80).optional().default(""),
  quantity: z.number().int().min(1).max(100),
  patientName: z.string().trim().min(1).max(120),
  patientPhone: z.string().trim().min(5).max(30),
});
export const quoteSchema = z.object({
  medicinePrice: z.number().nonnegative().max(1000000),
  deliveryFee: z.number().nonnegative().max(100000),
  note: z.string().trim().max(1000).optional().default(""),
});
