import { z } from 'zod';

const packageSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  inclusions: z.array(z.string()).optional(),
});

export const sessionCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  packages: z.array(packageSchema).optional(),
});

export const sessionCategoryUpdateSchema = sessionCategorySchema.partial();
