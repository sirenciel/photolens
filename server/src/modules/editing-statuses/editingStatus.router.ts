import { Router } from 'express';
import { editingStatusService } from './editingStatus.service';
import {
  editingStatusSchema,
  editingStatusUpdateSchema,
} from './editingStatus.validation';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const statuses = await editingStatusService.list();
    res.json(statuses);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const status = await editingStatusService.getById(req.params.id);
    res.json(status);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = editingStatusSchema.parse(req.body);
    const status = await editingStatusService.create(payload);
    res.status(201).json(status);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = editingStatusUpdateSchema.parse(req.body);
    const status = await editingStatusService.update(req.params.id, payload);
    res.json(status);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await editingStatusService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
