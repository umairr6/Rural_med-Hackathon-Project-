import { z } from 'zod';

export const medicineRequestSchema = z.object({
  region: z.enum(['Jammu','Kashmir']),
  district: z.string().trim().min(1).max(100),
  village: z.string().trim().min(1).max(120),
  medicine: z.string().trim().min(1).max(160),
  strength: z.string().trim().max(80).optional().default(''),
  form: z.string().trim().max(60).optional().default(''),
  quantity: z.number().int().min(1).max(100),
  landmark: z.string().trim().max(240).optional().default(''),
  address: z.string().trim().min(3).max(500),
  notes: z.string().trim().max(1000).optional().default(''),
  patientName: z.string().trim().min(1).max(120).optional(),
  patientPhone: z.string().trim().min(5).max(30),
});

export const quoteSchema = z.object({
  requestId: z.string().uuid(),
  medicinePrice: z.number().nonnegative().max(1000000),
  deliveryFee: z.number().nonnegative().max(100000),
  availabilityConfirmed: z.literal(true),
  prescriptionReviewed: z.boolean().default(false),
  note: z.string().trim().max(1000).optional().default(''),
});

export const orderStatusSchema = z.object({
  orderId: z.string().uuid(),
  action: z.enum(['accept_quote','update_delivery']),
  quoteId: z.string().uuid().optional(),
  status: z.enum(['preparing','out_for_delivery','delivered','delivery_failed']).optional(),
  note: z.string().trim().max(500).optional().default(''),
}).superRefine((value, context) => {
  if (value.action === 'accept_quote' && !value.quoteId) context.addIssue({ code: 'custom', path: ['quoteId'], message: 'quoteId is required to accept a quote' });
  if (value.action === 'update_delivery' && !value.status) context.addIssue({ code: 'custom', path: ['status'], message: 'status is required to update delivery' });
});
