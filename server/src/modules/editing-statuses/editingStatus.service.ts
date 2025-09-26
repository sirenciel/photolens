import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import createError from 'http-errors';
import { editingStatusRepository } from './editingStatus.repository';

export interface EditingStatusInput {
  id?: string;
  name: string;
  color: string;
}

export const editingStatusService = {
  list() {
    return editingStatusRepository.findAll();
  },

  async getById(id: string) {
    const status = await editingStatusRepository.findById(id);
    if (!status) {
      throw new createError.NotFound(`Editing status ${id} not found`);
    }
    return status;
  },

  create(payload: EditingStatusInput) {
    const id = payload.id ?? randomUUID();
    const data: Prisma.EditingStatusCreateInput = {
      id,
      name: payload.name,
      color: payload.color,
    };
    return editingStatusRepository.create(data);
  },

  async update(id: string, payload: Partial<EditingStatusInput>) {
    await editingStatusService.getById(id);
    const data: Prisma.EditingStatusUpdateInput = {
      name: payload.name,
      color: payload.color,
    };
    return editingStatusRepository.update(id, data);
  },

  async remove(id: string) {
    await editingStatusService.getById(id);
    await editingStatusRepository.delete(id);
  },
};
