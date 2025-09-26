import { z } from 'zod';

export const paymentAccountSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  type: z.string().min(1),
  details: z.string().optional(),
});

export const paymentAccountUpdateSchema = paymentAccountSchema.partial();
