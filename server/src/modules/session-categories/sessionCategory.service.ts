import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import createError from 'http-errors';
import { sessionCategoryRepository } from './sessionCategory.repository';

export interface SessionCategoryInput {
  id?: string;
  name: string;
  packages?: Array<{
    id?: string;
    name: string;
    price: number;
    inclusions?: string[];
  }>;
}

export const sessionCategoryService = {
  list() {
    return sessionCategoryRepository.findAll();
  },

  async getById(id: string) {
    const category = await sessionCategoryRepository.findById(id);
    if (!category) {
      throw new createError.NotFound(`Session category ${id} not found`);
    }
    return category;
  },

  create(payload: SessionCategoryInput) {
    const id = payload.id ?? randomUUID();
    const data: Prisma.SessionCategoryCreateInput = {
      id,
      name: payload.name,
      packages: payload.packages
        ? {
            create: payload.packages.map((pkg) => ({
              id: pkg.id ?? randomUUID(),
              name: pkg.name,
              price: pkg.price,
              inclusions: pkg.inclusions ?? [],
            })),
          }
        : undefined,
    };
    return sessionCategoryRepository.create(data);
  },

  async update(id: string, payload: SessionCategoryInput) {
    await sessionCategoryService.getById(id);
    const data: Prisma.SessionCategoryUpdateInput = {
      name: payload.name,
      packages: payload.packages
        ? {
            upsert: payload.packages.map((pkg) => {
              const idValue = pkg.id ?? randomUUID();
              return {
                where: { id: idValue },
                update: {
                  name: pkg.name,
                  price: pkg.price,
                  inclusions: pkg.inclusions ?? [],
                },
                create: {
                  id: idValue,
                  name: pkg.name,
                  price: pkg.price,
                  inclusions: pkg.inclusions ?? [],
                },
              };
            }),
          }
        : undefined,
    };
    return sessionCategoryRepository.update(id, data);
  },

  async remove(id: string) {
    await sessionCategoryService.getById(id);
    await sessionCategoryRepository.delete(id);
  },
};
