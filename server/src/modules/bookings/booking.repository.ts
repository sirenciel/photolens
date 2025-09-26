import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export const bookingRepository = {
  findAll: () =>
    prisma.booking.findMany({
      include: {
        client: true,
        sessionCategory: true,
        sessionPackage: true,
        photographer: true,
        invoice: { include: { items: true, payments: true } },
        editingJobs: true,
      },
      orderBy: { date: 'desc' },
    }),

  findById: (id: string) =>
    prisma.booking.findUnique({
      where: { id },
      include: {
        client: true,
        sessionCategory: true,
        sessionPackage: true,
        photographer: true,
        invoice: { include: { items: true, payments: true } },
        editingJobs: true,
      },
    }),

  create: (data: Prisma.BookingCreateInput) =>
    prisma.booking.create({
      data,
      include: {
        client: true,
        sessionCategory: true,
        sessionPackage: true,
        photographer: true,
        invoice: { include: { items: true, payments: true } },
        editingJobs: true,
      },
    }),

  update: (id: string, data: Prisma.BookingUpdateInput) =>
    prisma.booking.update({
      where: { id },
      data,
      include: {
        client: true,
        sessionCategory: true,
        sessionPackage: true,
        photographer: true,
        invoice: { include: { items: true, payments: true } },
        editingJobs: true,
      },
    }),

  delete: (id: string) => prisma.booking.delete({ where: { id } }),
};
