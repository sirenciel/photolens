import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import createError from 'http-errors';
import { staffRepository } from './staff.repository';

export const staffService = {
  async list() {
    return staffRepository.findAll();
  },

  async getById(id: string) {
    const staff = await staffRepository.findById(id);
    if (!staff) {
      throw new createError.NotFound(`Staff ${id} not found`);
    }
    return staff;
  },

  async create(payload: Prisma.StaffCreateInput) {
    const id = payload.id ?? randomUUID();
    return staffRepository.create({
      ...payload,
      id,
    });
  },

  async update(id: string, payload: Prisma.StaffUpdateInput) {
    await staffService.getById(id);
    return staffRepository.update(id, payload);
  },

  async remove(id: string) {
    await staffService.getById(id);
    await staffRepository.delete(id);
  },
};
