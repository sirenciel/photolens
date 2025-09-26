import { z } from 'zod';

export const editingStatusSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  color: z.string().min(1),
});

export const editingStatusUpdateSchema = editingStatusSchema.partial();
