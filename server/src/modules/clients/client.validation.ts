import { z } from 'zod';

export const clientBaseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email(),
  phone: z.string().min(3).optional(),
  avatarUrl: z.string().url().optional(),
  joinDate: z.coerce.date(),
  notes: z.string().optional(),
  financialStatus: z.string().optional(),
});

export const createClientSchema = clientBaseSchema;

export const updateClientSchema = clientBaseSchema.partial();
