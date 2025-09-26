import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export const editingStatusRepository = {
  findAll: () =>
    prisma.editingStatus.findMany({
      include: { jobs: true },
      orderBy: { name: 'asc' },
    }),

  findById: (id: string) =>
    prisma.editingStatus.findUnique({
      where: { id },
      include: { jobs: true },
    }),

  create: (data: Prisma.EditingStatusCreateInput) =>
    prisma.editingStatus.create({ data, include: { jobs: true } }),

  update: (id: string, data: Prisma.EditingStatusUpdateInput) =>
    prisma.editingStatus.update({
      where: { id },
      data,
      include: { jobs: true },
    }),

  delete: (id: string) => prisma.editingStatus.delete({ where: { id } }),
};
