import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export const staffRepository = {
  findAll: () =>
    prisma.staff.findMany({
      orderBy: { name: 'asc' },
    }),

  findById: (id: string) =>
    prisma.staff.findUnique({
      where: { id },
      include: {
        photographerBookings: true,
        editingJobs: true,
      },
    }),

  create: (data: Prisma.StaffCreateInput) => prisma.staff.create({ data }),

  update: (id: string, data: Prisma.StaffUpdateInput) =>
    prisma.staff.update({ where: { id }, data }),

  delete: (id: string) => prisma.staff.delete({ where: { id } }),
};
