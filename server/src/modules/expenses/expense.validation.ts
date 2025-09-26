import { z } from 'zod';

export const expenseSchema = z.object({
  id: z.string().optional(),
  category: z.string().min(1),
  description: z.string().min(1),
  amount: z.coerce.number(),
  date: z.coerce.date(),
  accountId: z.string(),
  bookingId: z.string().nullable().optional(),
});

export const expenseUpdateSchema = expenseSchema.partial();
