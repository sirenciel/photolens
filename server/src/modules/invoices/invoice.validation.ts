import { InvoiceStatus } from '@prisma/client';
import { z } from 'zod';

export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  price: z.coerce.number().nonnegative(),
});

export const invoiceSchema = z.object({
  id: z.string().optional(),
  bookingId: z.string().nullable().optional(),
  clientId: z.string(),
  clientName: z.string().min(1),
  clientAvatarUrl: z.string().url().nullable().optional(),
  amount: z.coerce.number().optional(),
  issueDate: z.coerce.date().nullable().optional(),
  dueDate: z.coerce.date(),
  status: z.nativeEnum(InvoiceStatus),
  lastReminderSent: z.coerce.date().nullable().optional(),
  items: z.array(invoiceItemSchema).min(1),
});

export const invoiceUpdateSchema = invoiceSchema.partial();

export const paymentSchema = z.object({
  id: z.string().optional(),
  amount: z.coerce.number().positive(),
  date: z.coerce.date(),
  accountId: z.string(),
  methodNotes: z.string().nullable().optional(),
  recordedById: z.string().nullable().optional(),
  recordedByName: z.string().nullable().optional(),
});
