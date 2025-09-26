import { Router } from 'express';
import { editingJobService } from './editingJob.service';
import {
  editingJobSchema,
  editingJobStatusSchema,
  editingJobUpdateSchema,
} from './editingJob.validation';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const jobs = await editingJobService.list();
    res.json(jobs);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const job = await editingJobService.getById(req.params.id);
    res.json(job);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = editingJobSchema.parse(req.body);
    const job = await editingJobService.create(payload);
    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = editingJobUpdateSchema.parse(req.body);
    const job = await editingJobService.update(req.params.id, payload);
    res.json(job);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const payload = editingJobStatusSchema.parse(req.body);
    const job = await editingJobService.updateStatus(req.params.id, payload.statusId);
    res.json(job);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await editingJobService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
