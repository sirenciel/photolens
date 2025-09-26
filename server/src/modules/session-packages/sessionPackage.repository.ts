import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export const sessionPackageRepository = {
  findAll: () =>
    prisma.sessionPackage.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    }),

  findById: (id: string) =>
    prisma.sessionPackage.findUnique({
      where: { id },
      include: { category: true },
    }),

  create: (data: Prisma.SessionPackageCreateInput) =>
    prisma.sessionPackage.create({ data, include: { category: true } }),

  update: (id: string, data: Prisma.SessionPackageUpdateInput) =>
    prisma.sessionPackage.update({
      where: { id },
      data,
      include: { category: true },
    }),

  delete: (id: string) => prisma.sessionPackage.delete({ where: { id } }),
};
