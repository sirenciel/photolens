import { Router } from 'express';
import { sessionCategoryService } from './sessionCategory.service';
import {
  sessionCategorySchema,
  sessionCategoryUpdateSchema,
} from './sessionCategory.validation';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const categories = await sessionCategoryService.list();
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const category = await sessionCategoryService.getById(req.params.id);
    res.json(category);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = sessionCategorySchema.parse(req.body);
    const category = await sessionCategoryService.create(payload);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = sessionCategoryUpdateSchema.parse(req.body);
    const category = await sessionCategoryService.update(req.params.id, payload);
    res.json(category);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await sessionCategoryService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
