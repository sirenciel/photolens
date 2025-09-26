import { z } from 'zod';

export const editingJobSchema = z.object({
  id: z.string().optional(),
  bookingId: z.string(),
  clientId: z.string(),
  clientName: z.string(),
  editorId: z.string().nullable().optional(),
  editorName: z.string().nullable().optional(),
  editorAvatarUrl: z.string().url().nullable().optional(),
  statusId: z.string(),
  uploadDate: z.coerce.date(),
  driveFolderUrl: z.string().url().nullable().optional(),
  photographerNotes: z.string().nullable().optional(),
  priority: z.string().optional(),
  revisionCount: z.number().int().nonnegative().optional(),
  revisionNotes: z.unknown().optional(),
});

export const editingJobUpdateSchema = editingJobSchema.partial();

export const editingJobStatusSchema = z.object({
  statusId: z.string(),
});
