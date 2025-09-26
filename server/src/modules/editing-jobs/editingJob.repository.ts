import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export const editingJobRepository = {
  findAll: () =>
    prisma.editingJob.findMany({
      include: {
        booking: true,
        client: true,
        editor: true,
        status: true,
      },
      orderBy: { uploadDate: 'desc' },
    }),

  findById: (id: string) =>
    prisma.editingJob.findUnique({
      where: { id },
      include: {
        booking: true,
        client: true,
        editor: true,
        status: true,
      },
    }),

  create: (data: Prisma.EditingJobCreateInput) =>
    prisma.editingJob.create({
      data,
      include: {
        booking: true,
        client: true,
        editor: true,
        status: true,
      },
    }),

  update: (id: string, data: Prisma.EditingJobUpdateInput) =>
    prisma.editingJob.update({
      where: { id },
      data,
      include: {
        booking: true,
        client: true,
        editor: true,
        status: true,
      },
    }),

  delete: (id: string) => prisma.editingJob.delete({ where: { id } }),
};
