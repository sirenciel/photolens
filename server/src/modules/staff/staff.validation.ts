import { StaffStatus, UserRole } from '@prisma/client';
import { z } from 'zod';

export const staffBaseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  email: z.string().email(),
  avatarUrl: z.string().url().optional(),
  role: z.nativeEnum(UserRole),
  status: z.nativeEnum(StaffStatus),
  lastLogin: z.coerce.date().optional(),
});

export const createStaffSchema = staffBaseSchema;
export const updateStaffSchema = staffBaseSchema.partial();
