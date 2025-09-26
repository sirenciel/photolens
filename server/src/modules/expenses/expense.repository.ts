import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export const expenseRepository = {
  findAll: () =>
    prisma.expense.findMany({
      include: { account: true, booking: true },
      orderBy: { date: 'desc' },
    }),

  findById: (id: string) =>
    prisma.expense.findUnique({
      where: { id },
      include: { account: true, booking: true },
    }),

  create: (data: Prisma.ExpenseCreateInput) =>
    prisma.expense.create({ data, include: { account: true, booking: true } }),

  update: (id: string, data: Prisma.ExpenseUpdateInput) =>
    prisma.expense.update({
      where: { id },
      data,
      include: { account: true, booking: true },
    }),

  delete: (id: string) => prisma.expense.delete({ where: { id } }),
};
