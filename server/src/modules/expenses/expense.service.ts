import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import createError from 'http-errors';
import { expenseRepository } from './expense.repository';

export interface ExpenseInput {
  id?: string;
  category: string;
  description: string;
  amount: number;
  date: Date;
  accountId: string;
  bookingId?: string | null;
}

export const expenseService = {
  list() {
    return expenseRepository.findAll();
  },

  async getById(id: string) {
    const expense = await expenseRepository.findById(id);
    if (!expense) {
      throw new createError.NotFound(`Expense ${id} not found`);
    }
    return expense;
  },

  create(payload: ExpenseInput) {
    const id = payload.id ?? randomUUID();
    const data: Prisma.ExpenseCreateInput = {
      id,
      category: payload.category,
      description: payload.description,
      amount: payload.amount,
      date: payload.date,
      account: { connect: { id: payload.accountId } },
      booking: payload.bookingId ? { connect: { id: payload.bookingId } } : undefined,
    };
    return expenseRepository.create(data);
  },

  async update(id: string, payload: Partial<ExpenseInput>) {
    await expenseService.getById(id);
    const data: Prisma.ExpenseUpdateInput = {
      category: payload.category,
      description: payload.description,
      amount: payload.amount,
      date: payload.date,
      account: payload.accountId ? { connect: { id: payload.accountId } } : undefined,
      booking: payload.bookingId
        ? { connect: { id: payload.bookingId } }
        : payload.bookingId === null
        ? { disconnect: true }
        : undefined,
    };
    return expenseRepository.update(id, data);
  },

  async remove(id: string) {
    await expenseService.getById(id);
    await expenseRepository.delete(id);
  },
};
