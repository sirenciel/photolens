import { Router } from 'express';
import { sessionPackageService } from './sessionPackage.service';
import {
  sessionPackageSchema,
  sessionPackageUpdateSchema,
} from './sessionPackage.validation';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const packages = await sessionPackageService.list();
    res.json(packages);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const pkg = await sessionPackageService.getById(req.params.id);
    res.json(pkg);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = sessionPackageSchema.parse(req.body);
    const pkg = await sessionPackageService.create(payload);
    res.status(201).json(pkg);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = sessionPackageUpdateSchema.parse(req.body);
    const pkg = await sessionPackageService.update(req.params.id, payload);
    res.json(pkg);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await sessionPackageService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
