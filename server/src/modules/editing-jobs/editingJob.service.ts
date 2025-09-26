import { JobPriority, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import createError from 'http-errors';
import prisma from '../../lib/prisma';
import { editingJobRepository } from './editingJob.repository';

export interface EditingJobInput {
  id?: string;
  bookingId: string;
  clientId: string;
  clientName: string;
  editorId?: string | null;
  editorName?: string | null;
  editorAvatarUrl?: string | null;
  statusId: string;
  uploadDate: Date;
  driveFolderUrl?: string | null;
  photographerNotes?: string | null;
  priority?: string;
  revisionCount?: number;
  revisionNotes?: unknown;
}

const mapPriority = (value?: string | null) => {
  if (!value) return JobPriority.Normal;
  const normalized = value.toLowerCase();
  switch (normalized) {
    case 'low':
      return JobPriority.Low;
    case 'high':
      return JobPriority.High;
    case 'urgent':
      return JobPriority.Urgent;
    default:
      return JobPriority.Normal;
  }
};

export const editingJobService = {
  list() {
    return editingJobRepository.findAll();
  },

  async getById(id: string) {
    const job = await editingJobRepository.findById(id);
    if (!job) {
      throw new createError.NotFound(`Editing job ${id} not found`);
    }
    return job;
  },

  create(payload: EditingJobInput) {
    const id = payload.id ?? randomUUID();
    const data: Prisma.EditingJobCreateInput = {
      id,
      booking: { connect: { id: payload.bookingId } },
      client: { connect: { id: payload.clientId } },
      clientName: payload.clientName,
      editor: payload.editorId ? { connect: { id: payload.editorId } } : undefined,
      editorName: payload.editorName ?? undefined,
      editorAvatarUrl: payload.editorAvatarUrl ?? undefined,
      status: { connect: { id: payload.statusId } },
      uploadDate: payload.uploadDate,
      driveFolderUrl: payload.driveFolderUrl ?? undefined,
      photographerNotes: payload.photographerNotes ?? undefined,
      priority: mapPriority(payload.priority),
      revisionCount: payload.revisionCount ?? 0,
      revisionNotes: payload.revisionNotes,
    };
    return editingJobRepository.create(data);
  },

  async update(id: string, payload: Partial<EditingJobInput>) {
    await editingJobService.getById(id);
    const data: Prisma.EditingJobUpdateInput = {
      editor: payload.editorId
        ? { connect: { id: payload.editorId } }
        : payload.editorId === null
        ? { disconnect: true }
        : undefined,
      editorName: payload.editorName,
      editorAvatarUrl: payload.editorAvatarUrl,
      status: payload.statusId ? { connect: { id: payload.statusId } } : undefined,
      uploadDate: payload.uploadDate,
      driveFolderUrl: payload.driveFolderUrl,
      photographerNotes: payload.photographerNotes,
      priority: payload.priority ? mapPriority(payload.priority) : undefined,
      revisionCount: payload.revisionCount,
      revisionNotes: payload.revisionNotes,
    };
    return editingJobRepository.update(id, data);
  },

  async updateStatus(id: string, statusId: string) {
    await editingJobService.getById(id);
    return editingJobRepository.update(id, { status: { connect: { id: statusId } } });
  },

  async ensureForCompletedBooking(bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { client: true, editingJobs: true },
    });
    if (!booking || booking.status !== 'Completed') {
      return null;
    }

    if (booking.editingJobs.length > 0) {
      return booking.editingJobs[0];
    }

    const defaultStatus = await prisma.editingStatus.findFirst({
      orderBy: { name: 'asc' },
    });

    if (!defaultStatus) {
      throw new createError.BadRequest('No editing statuses configured');
    }

    return editingJobService.create({
      bookingId: booking.id,
      clientId: booking.clientId,
      clientName: booking.clientName,
      statusId: defaultStatus.id,
      uploadDate: new Date(),
      priority: 'Normal',
    });
  },

  async remove(id: string) {
    await editingJobService.getById(id);
    await editingJobRepository.delete(id);
  },
};
