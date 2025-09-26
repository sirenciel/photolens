import { InvoiceStatus, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import createError from 'http-errors';
import prisma from '../../lib/prisma';
import { clientRepository } from '../clients/client.repository';
import { invoiceRepository } from './invoice.repository';

export interface InvoiceItemInput {
  id?: string;
  description: string;
  quantity: number;
  price: number;
}

export interface InvoiceInput {
  id?: string;
  bookingId?: string | null;
  clientId: string;
  clientName: string;
  clientAvatarUrl?: string | null;
  amount?: number;
  issueDate?: Date | null;
  dueDate: Date;
  status: InvoiceStatus;
  lastReminderSent?: Date | null;
  items: InvoiceItemInput[];
}

export interface PaymentInput {
  id?: string;
  amount: number;
  date: Date;
  accountId: string;
  methodNotes?: string | null;
  recordedById?: string | null;
  recordedByName?: string | null;
}

const calculateAmount = (items: InvoiceItemInput[]) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

const computeStatus = (invoice: { amount: Prisma.Decimal; amountPaid: Prisma.Decimal; dueDate: Date; status: InvoiceStatus; }) => {
  const amount = Number(invoice.amount);
  const paid = Number(invoice.amountPaid);
  if (paid >= amount && amount > 0) {
    return InvoiceStatus.Paid;
  }
  if (invoice.dueDate.getTime() < Date.now()) {
    return InvoiceStatus.Overdue;
  }
  return InvoiceStatus.Sent;
};

export const invoiceService = {
  list() {
    return invoiceRepository.findAll();
  },

  async getById(id: string) {
    const invoice = await invoiceRepository.findById(id);
    if (!invoice) {
      throw new createError.NotFound(`Invoice ${id} not found`);
    }
    return invoice;
  },

  async create(payload: InvoiceInput) {
    const id = payload.id ?? randomUUID();
    const items = payload.items ?? [];
    const amount = payload.amount ?? calculateAmount(items);
    const data: Prisma.InvoiceCreateInput = {
      id,
      booking: payload.bookingId ? { connect: { id: payload.bookingId } } : undefined,
      client: { connect: { id: payload.clientId } },
      clientName: payload.clientName,
      clientAvatarUrl: payload.clientAvatarUrl ?? undefined,
      amount,
      amountPaid: 0,
      issueDate: payload.issueDate ?? undefined,
      dueDate: payload.dueDate,
      status: payload.status,
      lastReminderSent: payload.lastReminderSent ?? undefined,
      items: {
        create: items.map((item) => ({
          id: item.id ?? randomUUID(),
          description: item.description,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    };

    const invoice = await invoiceRepository.create(data);
    await clientRepository.updateStats(payload.clientId);
    return invoiceRepository.findById(invoice.id);
  },

  async update(id: string, payload: Partial<InvoiceInput>) {
    const existing = await invoiceService.getById(id);
    const items = payload.items;
    const amount = payload.amount ?? (items ? calculateAmount(items) : undefined);

    const data: Prisma.InvoiceUpdateInput = {
      booking: payload.bookingId
        ? { connect: { id: payload.bookingId } }
        : payload.bookingId === null
        ? { disconnect: true }
        : undefined,
      client: payload.clientId ? { connect: { id: payload.clientId } } : undefined,
      clientName: payload.clientName,
      clientAvatarUrl: payload.clientAvatarUrl,
      amount,
      issueDate: payload.issueDate,
      dueDate: payload.dueDate,
      status: payload.status,
      lastReminderSent: payload.lastReminderSent,
      items: items
        ? {
            deleteMany: {},
            create: items.map((item) => ({
              id: item.id ?? randomUUID(),
              description: item.description,
              quantity: item.quantity,
              price: item.price,
            })),
          }
        : undefined,
    };

    const invoice = await invoiceRepository.update(id, data);
    await clientRepository.updateStats(invoice.clientId);
    return invoiceRepository.findById(id);
  },

  async addPayment(id: string, payload: PaymentInput) {
    const invoice = await invoiceService.getById(id);
    const paymentId = payload.id ?? randomUUID();

    await prisma.payment.create({
      data: {
        id: paymentId,
        amount: payload.amount,
        date: payload.date,
        account: { connect: { id: payload.accountId } },
        invoice: { connect: { id } },
        methodNotes: payload.methodNotes ?? undefined,
        recordedBy: payload.recordedById
          ? { connect: { id: payload.recordedById } }
          : undefined,
        recordedByName: payload.recordedByName ?? undefined,
      },
    });

    const payments = await prisma.payment.aggregate({
      where: { invoiceId: id },
      _sum: { amount: true },
    });

    const amountPaid = payments._sum.amount ?? new Prisma.Decimal(0);
    const newStatus = computeStatus({
      amount: invoice.amount,
      amountPaid,
      dueDate: invoice.dueDate,
      status: invoice.status,
    });

    await prisma.invoice.update({
      where: { id },
      data: { amountPaid, status: newStatus },
    });

    await clientRepository.updateStats(invoice.clientId);
    return invoiceRepository.findById(id);
  },

  async remove(id: string) {
    const invoice = await invoiceService.getById(id);
    await invoiceRepository.delete(id);
    await clientRepository.updateStats(invoice.clientId);
  },
};
