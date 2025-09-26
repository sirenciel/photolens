import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export const invoiceRepository = {
  findAll: () =>
    prisma.invoice.findMany({
      include: {
        client: true,
        booking: true,
        items: true,
        payments: { include: { account: true, recordedBy: true } },
      },
      orderBy: { issueDate: 'desc' },
    }),

  findById: (id: string) =>
    prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        booking: true,
        items: true,
        payments: { include: { account: true, recordedBy: true } },
      },
    }),

  create: (data: Prisma.InvoiceCreateInput) =>
    prisma.invoice.create({
      data,
      include: {
        client: true,
        booking: true,
        items: true,
        payments: { include: { account: true, recordedBy: true } },
      },
    }),

  update: (id: string, data: Prisma.InvoiceUpdateInput) =>
    prisma.invoice.update({
      where: { id },
      data,
      include: {
        client: true,
        booking: true,
        items: true,
        payments: { include: { account: true, recordedBy: true } },
      },
    }),

  delete: (id: string) => prisma.invoice.delete({ where: { id } }),
};
