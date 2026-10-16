import { describe, expect, it } from 'vitest';
import { medicineRequestSchema, quoteSchema, orderStatusSchema } from '../src/lib/validation';

describe('medicine request validation', () => {
  it('accepts a bounded Jammu and Kashmir medicine request', () => {
    const result = medicineRequestSchema.safeParse({ region: 'Kashmir', district: 'Baramulla', village: 'Sopore', medicine: 'Example medicine', quantity: 2, address: 'Demo address', patientPhone: '0000000000' });
    expect(result.success).toBe(true);
  });
  it('rejects an invalid quantity', () => {
    const result = medicineRequestSchema.safeParse({ region: 'Jammu', district: 'Jammu', village: 'Jammu city', medicine: 'Example medicine', quantity: 0, address: 'Demo address', patientPhone: '0000000000' });
    expect(result.success).toBe(false);
  });
});

describe('quote validation', () => {
  it('requires explicit availability confirmation', () => {
    const result = quoteSchema.safeParse({ requestId: '6f9619ff-8b86-d011-b42d-00cf4fc964ff', medicinePrice: 100, deliveryFee: 20, availabilityConfirmed: false });
    expect(result.success).toBe(false);
  });
  it('rejects negative amounts', () => {
    const result = quoteSchema.safeParse({ requestId: '6f9619ff-8b86-d011-b42d-00cf4fc964ff', medicinePrice: -1, deliveryFee: 0, availabilityConfirmed: true });
    expect(result.success).toBe(false);
  });
});

describe('order action validation', () => {
  it('requires a quote id when accepting a quote', () => {
    const result = orderStatusSchema.safeParse({ orderId: '6f9619ff-8b86-d011-b42d-00cf4fc964ff', action: 'accept_quote' });
    expect(result.success).toBe(false);
  });
  it('rejects unsupported delivery states', () => {
    const result = orderStatusSchema.safeParse({ orderId: '6f9619ff-8b86-d011-b42d-00cf4fc964ff', action: 'update_delivery', status: 'cancelled' });
    expect(result.success).toBe(false);
  });
});
