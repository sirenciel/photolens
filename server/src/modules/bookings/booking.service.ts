import { BookingStatus, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import createError from 'http-errors';
import { clientRepository } from '../clients/client.repository';
import { editingJobService } from '../editing-jobs';
import { bookingRepository } from './booking.repository';

export interface BookingInput {
  id?: string;
  clientId: string;
  clientName: string;
  clientAvatarUrl?: string | null;
  sessionCategoryId: string;
  sessionPackageId: string;
  sessionType: string;
  photographerId?: string | null;
  photographerName?: string | null;
  date: Date;
  status: BookingStatus;
  notes?: string | null;
  location?: string | null;
  photoSelections?: unknown;
}

export const bookingService = {
  list() {
    return bookingRepository.findAll();
  },

  async getById(id: string) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new createError.NotFound(`Booking ${id} not found`);
    }
    return booking;
  },

  async create(payload: BookingInput) {
    const id = payload.id ?? randomUUID();
    const data: Prisma.BookingCreateInput = {
      id,
      client: { connect: { id: payload.clientId } },
      clientName: payload.clientName,
      clientAvatarUrl: payload.clientAvatarUrl ?? undefined,
      sessionCategory: { connect: { id: payload.sessionCategoryId } },
      sessionPackage: { connect: { id: payload.sessionPackageId } },
      sessionType: payload.sessionType,
      photographer: payload.photographerId
        ? { connect: { id: payload.photographerId } }
        : undefined,
      photographerName: payload.photographerName ?? undefined,
      date: payload.date,
      status: payload.status,
      notes: payload.notes ?? undefined,
      location: payload.location ?? undefined,
      photoSelections: payload.photoSelections,
    };

    const booking = await bookingRepository.create(data);
    await clientRepository.updateStats(payload.clientId);
    if (booking.status === BookingStatus.Completed) {
      await editingJobService.ensureForCompletedBooking(booking.id);
    }
    return bookingRepository.findById(booking.id);
  },

  async update(id: string, payload: Partial<BookingInput>) {
    const existing = await bookingService.getById(id);
    const nextStatus = payload.status ?? existing.status;

    const data: Prisma.BookingUpdateInput = {
      client: payload.clientId ? { connect: { id: payload.clientId } } : undefined,
      clientName: payload.clientName,
      clientAvatarUrl: payload.clientAvatarUrl,
      sessionCategory: payload.sessionCategoryId
        ? { connect: { id: payload.sessionCategoryId } }
        : undefined,
      sessionPackage: payload.sessionPackageId
        ? { connect: { id: payload.sessionPackageId } }
        : undefined,
      sessionType: payload.sessionType,
      photographer: payload.photographerId
        ? { connect: { id: payload.photographerId } }
        : payload.photographerId === null
        ? { disconnect: true }
        : undefined,
      photographerName: payload.photographerName,
      date: payload.date,
      status: payload.status,
      notes: payload.notes,
      location: payload.location,
      photoSelections: payload.photoSelections,
    };

    const booking = await bookingRepository.update(id, data);
    await clientRepository.updateStats(booking.clientId);

    if (nextStatus === BookingStatus.Completed && existing.status !== BookingStatus.Completed) {
      await editingJobService.ensureForCompletedBooking(booking.id);
    }

    return bookingRepository.findById(id);
  },

  async remove(id: string) {
    const booking = await bookingService.getById(id);
    await bookingRepository.delete(id);
    await clientRepository.updateStats(booking.clientId);
  },
};
