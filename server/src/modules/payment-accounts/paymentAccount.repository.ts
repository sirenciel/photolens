import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export const paymentAccountRepository = {
  findAll: () =>
    prisma.paymentAccount.findMany({
      include: { payments: true, expenses: true },
      orderBy: { name: 'asc' },
    }),

  findById: (id: string) =>
    prisma.paymentAccount.findUnique({
      where: { id },
      include: { payments: true, expenses: true },
    }),

  create: (data: Prisma.PaymentAccountCreateInput) =>
    prisma.paymentAccount.create({ data, include: { payments: true, expenses: true } }),

  update: (id: string, data: Prisma.PaymentAccountUpdateInput) =>
    prisma.paymentAccount.update({
      where: { id },
      data,
      include: { payments: true, expenses: true },
    }),

  delete: (id: string) => prisma.paymentAccount.delete({ where: { id } }),
};
