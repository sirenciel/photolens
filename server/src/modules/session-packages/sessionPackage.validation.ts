import { z } from 'zod';

export const sessionPackageSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string(),
  name: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  inclusions: z.array(z.string()).optional(),
});

export const sessionPackageUpdateSchema = sessionPackageSchema.partial();
