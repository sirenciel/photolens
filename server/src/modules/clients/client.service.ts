import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import createError from 'http-errors';
import { clientRepository } from './client.repository';

export const clientService = {
  async list() {
    return clientRepository.findAll();
  },

  async getById(id: string) {
    const client = await clientRepository.findById(id);
    if (!client) {
      throw new createError.NotFound(`Client ${id} not found`);
    }
    return client;
  },

  async create(payload: Prisma.ClientCreateInput) {
    const id = payload.id ?? randomUUID();
    const client = await clientRepository.create({
      ...payload,
      id,
    });
    await clientRepository.updateStats(id);
    return clientRepository.findById(id);
  },

  async update(id: string, payload: Prisma.ClientUpdateInput) {
    await clientService.getById(id);
    const client = await clientRepository.update(id, payload);
    await clientRepository.updateStats(id);
    return clientRepository.findById(client.id);
  },

  async remove(id: string) {
    await clientService.getById(id);
    await clientRepository.delete(id);
  },

  async refreshStats(id: string) {
    return clientRepository.updateStats(id);
  },
};
