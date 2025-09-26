import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export const sessionCategoryRepository = {
  findAll: () =>
    prisma.sessionCategory.findMany({
      include: { packages: true },
      orderBy: { name: 'asc' },
    }),

  findById: (id: string) =>
    prisma.sessionCategory.findUnique({
      where: { id },
      include: { packages: true },
    }),

  create: (data: Prisma.SessionCategoryCreateInput) =>
    prisma.sessionCategory.create({ data, include: { packages: true } }),

  update: (id: string, data: Prisma.SessionCategoryUpdateInput) =>
    prisma.sessionCategory.update({
      where: { id },
      data,
      include: { packages: true },
    }),

  delete: (id: string) => prisma.sessionCategory.delete({ where: { id } }),
};
