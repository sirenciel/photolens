import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import createError from 'http-errors';
import { sessionPackageRepository } from './sessionPackage.repository';

export interface SessionPackageInput {
  id?: string;
  categoryId: string;
  name: string;
  price: number;
  inclusions?: string[];
}

export const sessionPackageService = {
  list() {
    return sessionPackageRepository.findAll();
  },

  async getById(id: string) {
    const pkg = await sessionPackageRepository.findById(id);
    if (!pkg) {
      throw new createError.NotFound(`Session package ${id} not found`);
    }
    return pkg;
  },

  create(payload: SessionPackageInput) {
    const id = payload.id ?? randomUUID();
    const data: Prisma.SessionPackageCreateInput = {
      id,
      name: payload.name,
      price: payload.price,
      inclusions: payload.inclusions ?? [],
      category: {
        connect: { id: payload.categoryId },
      },
    };
    return sessionPackageRepository.create(data);
  },

  async update(id: string, payload: Partial<SessionPackageInput>) {
    await sessionPackageService.getById(id);
    const data: Prisma.SessionPackageUpdateInput = {
      name: payload.name,
      price: payload.price,
      inclusions: payload.inclusions,
      category: payload.categoryId
        ? {
            connect: { id: payload.categoryId },
          }
        : undefined,
    };
    return sessionPackageRepository.update(id, data);
  },

  async remove(id: string) {
    await sessionPackageService.getById(id);
    await sessionPackageRepository.delete(id);
  },
};
