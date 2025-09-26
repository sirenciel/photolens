import { BookingStatus } from '@prisma/client';
import { z } from 'zod';

const photoSelectionSchema = z.object({
  name: z.string(),
  edited: z.boolean(),
});

export const bookingSchema = z.object({
  id: z.string().optional(),
  clientId: z.string(),
  clientName: z.string().min(1),
  clientAvatarUrl: z.string().url().optional(),
  sessionCategoryId: z.string(),
  sessionPackageId: z.string(),
  sessionType: z.string().min(1),
  photographerId: z.string().nullable().optional(),
  photographerName: z.string().nullable().optional(),
  date: z.coerce.date(),
  status: z.nativeEnum(BookingStatus),
  notes: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  photoSelections: z.array(photoSelectionSchema).optional(),
});

export const bookingUpdateSchema = bookingSchema.partial();
