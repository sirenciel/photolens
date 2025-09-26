import { Router } from 'express';
import { staffService } from './staff.service';
import { createStaffSchema, updateStaffSchema } from './staff.validation';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const staff = await staffService.list();
    res.json(staff);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const staff = await staffService.getById(req.params.id);
    res.json(staff);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = createStaffSchema.parse(req.body);
    const staff = await staffService.create(payload);
    res.status(201).json(staff);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = updateStaffSchema.parse(req.body);
    const staff = await staffService.update(req.params.id, payload);
    res.json(staff);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await staffService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
