import 'dotenv/config';
import { BookingStatus, InvoiceStatus, JobPriority, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import prisma from './lib/prisma';
import { clientRepository } from './modules/clients/client.repository';
import {
  mockBookings,
  mockClients,
  mockEditingJobs,
  mockEditingStatuses,
  mockExpenses,
  mockInvoices,
  mockPaymentAccounts,
  mockSessionTypes,
  mockStaff,
} from '../../services/mockData';

const priorityMap: Record<string, JobPriority> = {
  low: JobPriority.Low,
  normal: JobPriority.Normal,
  high: JobPriority.High,
  urgent: JobPriority.Urgent,
};

const bookingStatusMap: Record<string, BookingStatus> = {
  pending: BookingStatus.Pending,
  confirmed: BookingStatus.Confirmed,
  completed: BookingStatus.Completed,
  cancelled: BookingStatus.Cancelled,
};

const invoiceStatusMap: Record<string, InvoiceStatus> = {
  paid: InvoiceStatus.Paid,
  sent: InvoiceStatus.Sent,
  overdue: InvoiceStatus.Overdue,
};

async function resetDatabase() {
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.editingJob.deleteMany();
  await prisma.editingStatus.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.sessionPackage.deleteMany();
  await prisma.sessionCategory.deleteMany();
  await prisma.paymentAccount.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.client.deleteMany();
}

async function seedStaff() {
  for (const staff of mockStaff) {
    await prisma.staff.create({
      data: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        avatarUrl: staff.avatarUrl,
        role: staff.role,
        status: staff.status,
        lastLogin: staff.lastLogin ?? undefined,
      },
    });
  }
}

async function seedClients() {
  for (const client of mockClients) {
    await prisma.client.create({
      data: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        avatarUrl: client.avatarUrl,
        joinDate: client.joinDate,
        totalBookings: client.totalBookings ?? 0,
        totalSpent: new Prisma.Decimal(client.totalSpent ?? 0),
        notes: client.notes,
        financialStatus: client.financialStatus,
      },
    });
  }
}

async function seedEditingStatuses() {
  for (const status of mockEditingStatuses) {
    await prisma.editingStatus.create({
      data: {
        id: status.id,
        name: status.name,
        color: status.color,
      },
    });
  }
}

async function seedSessionCategories() {
  for (const category of mockSessionTypes) {
    await prisma.sessionCategory.create({
      data: {
        id: category.id,
        name: category.name,
        packages: {
          create: category.packages.map((pkg) => ({
            id: pkg.id,
            name: pkg.name,
            price: pkg.price,
            inclusions: pkg.inclusions ?? [],
          })),
        },
      },
    });
  }
}

async function seedPaymentAccounts() {
  for (const account of mockPaymentAccounts) {
    await prisma.paymentAccount.create({
      data: {
        id: account.id,
        name: account.name,
        type: account.type,
        details: account.details,
      },
    });
  }
}

async function seedBookings() {
  for (const booking of mockBookings) {
    const status = bookingStatusMap[booking.status.toLowerCase()] ?? BookingStatus.Pending;
    await prisma.booking.create({
      data: {
        id: booking.id,
        client: { connect: { id: booking.clientId } },
        clientName: booking.clientName,
        clientAvatarUrl: booking.clientAvatarUrl,
        sessionCategory: { connect: { id: booking.sessionCategoryId } },
        sessionPackage: { connect: { id: booking.sessionPackageId } },
        sessionType: booking.sessionType,
        photographer: booking.photographerId ? { connect: { id: booking.photographerId } } : undefined,
        photographerName: booking.photographer,
        date: booking.date,
        status,
        notes: booking.notes,
        location: booking.location,
        photoSelections: booking.photoSelections ?? undefined,
      },
    });
  }
}

async function seedInvoices() {
  const staffByName = new Map(mockStaff.map((staff) => [staff.name, staff.id]));
  for (const invoice of mockInvoices) {
    const status = invoiceStatusMap[invoice.status.toLowerCase()] ?? InvoiceStatus.Sent;
    const payments = invoice.payments ?? [];
    const amountPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    await prisma.invoice.create({
      data: {
        id: invoice.id,
        booking: invoice.bookingId !== '-' ? { connect: { id: invoice.bookingId } } : undefined,
        client: { connect: { id: invoice.clientId } },
        clientName: invoice.clientName,
        clientAvatarUrl: invoice.clientAvatarUrl,
        amount: invoice.amount,
        amountPaid,
        issueDate: invoice.issueDate ?? undefined,
        dueDate: invoice.dueDate,
        status,
        lastReminderSent: invoice.lastReminderSent ?? undefined,
        items: {
          create: invoice.items.map((item) => ({
            id: item.id ?? randomUUID(),
            description: item.description,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        payments: {
          create: payments.map((payment) => ({
            id: payment.id ?? randomUUID(),
            amount: payment.amount,
            date: payment.date,
            account: { connect: { id: payment.accountId } },
            methodNotes: payment.methodNotes ?? undefined,
            recordedByName: payment.recordedBy ?? undefined,
            recordedBy: payment.recordedBy && staffByName.get(payment.recordedBy)
              ? { connect: { id: staffByName.get(payment.recordedBy)! } }
              : undefined,
          })),
        },
      },
    });
  }
}

async function seedEditingJobs() {
  for (const job of mockEditingJobs) {
    const priority = priorityMap[job.priority?.toLowerCase?.() ?? 'normal'] ?? JobPriority.Normal;
    await prisma.editingJob.create({
      data: {
        id: job.id,
        booking: { connect: { id: job.bookingId } },
        client: { connect: { id: job.clientId } },
        clientName: job.clientName,
        editor: job.editorId ? { connect: { id: job.editorId } } : undefined,
        editorName: job.editorName ?? undefined,
        editorAvatarUrl: job.editorAvatarUrl ?? undefined,
        status: { connect: { id: job.statusId } },
        uploadDate: job.uploadDate,
        driveFolderUrl: job.driveFolderUrl ?? undefined,
        photographerNotes: job.photographerNotes ?? undefined,
        priority,
        revisionCount: job.revisionCount ?? 0,
        revisionNotes: job.revisionNotes ?? undefined,
      },
    });
  }
}

async function seedExpenses() {
  for (const expense of mockExpenses) {
    await prisma.expense.create({
      data: {
        id: expense.id,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        account: { connect: { id: expense.accountId } },
        booking: expense.bookingId ? { connect: { id: expense.bookingId } } : undefined,
      },
    });
  }
}

async function refreshClientStats() {
  const clients = await prisma.client.findMany({ select: { id: true } });
  for (const client of clients) {
    await clientRepository.updateStats(client.id);
  }
}

async function main() {
  await resetDatabase();
  await seedStaff();
  await seedClients();
  await seedEditingStatuses();
  await seedSessionCategories();
  await seedPaymentAccounts();
  await seedBookings();
  await seedInvoices();
  await seedEditingJobs();
  await seedExpenses();
  await refreshClientStats();
}

main()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Database seeded successfully');
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Seeding failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
