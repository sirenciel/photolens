import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export const clientRepository = {
  findAll: () =>
    prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
    }),

  findById: (id: string) =>
    prisma.client.findUnique({
      where: { id },
      include: {
        bookings: true,
        invoices: { include: { items: true, payments: true } },
      },
    }),

  create: (data: Prisma.ClientCreateInput) => prisma.client.create({ data }),

  update: (id: string, data: Prisma.ClientUpdateInput) =>
    prisma.client.update({ where: { id }, data }),

  delete: (id: string) => prisma.client.delete({ where: { id } }),

  updateStats: async (id: string) => {
    const [bookingSummary, invoiceSummary] = await Promise.all([
      prisma.booking.aggregate({
        where: { clientId: id, status: 'Completed' },
        _count: { _all: true },
      }),
      prisma.invoice.aggregate({
        where: { clientId: id, status: 'Paid' },
        _sum: { amount: true },
      }),
    ]);

    const totalBookings = bookingSummary._count._all ?? 0;
    const totalSpent = invoiceSummary._sum.amount ?? new Prisma.Decimal(0);

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        totalBookings,
        totalSpent,
      },
    });

    return updatedClient;
  },
};
