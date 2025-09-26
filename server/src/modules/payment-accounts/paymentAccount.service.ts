import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import createError from 'http-errors';
import { paymentAccountRepository } from './paymentAccount.repository';

export interface PaymentAccountInput {
  id?: string;
  name: string;
  type: string;
  details?: string;
}

export const paymentAccountService = {
  list() {
    return paymentAccountRepository.findAll();
  },

  async getById(id: string) {
    const account = await paymentAccountRepository.findById(id);
    if (!account) {
      throw new createError.NotFound(`Payment account ${id} not found`);
    }
    return account;
  },

  create(payload: PaymentAccountInput) {
    const id = payload.id ?? randomUUID();
    const data: Prisma.PaymentAccountCreateInput = {
      id,
      name: payload.name,
      type: payload.type,
      details: payload.details,
    };
    return paymentAccountRepository.create(data);
  },

  async update(id: string, payload: Partial<PaymentAccountInput>) {
    await paymentAccountService.getById(id);
    const data: Prisma.PaymentAccountUpdateInput = {
      name: payload.name,
      type: payload.type,
      details: payload.details,
    };
    return paymentAccountRepository.update(id, data);
  },

  async remove(id: string) {
    await paymentAccountService.getById(id);
    await paymentAccountRepository.delete(id);
  },
};
