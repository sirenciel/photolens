import { Router } from 'express';
import { clientService } from './client.service';
import { createClientSchema, updateClientSchema } from './client.validation';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const clients = await clientService.list();
    res.json(clients);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const client = await clientService.getById(req.params.id);
    res.json(client);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = createClientSchema.parse(req.body);
    const client = await clientService.create({
      ...payload,
      joinDate: payload.joinDate,
    });
    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = updateClientSchema.parse(req.body);
    const client = await clientService.update(req.params.id, payload);
    res.json(client);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await clientService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/:id/refresh-stats', async (req, res, next) => {
  try {
    const client = await clientService.refreshStats(req.params.id);
    res.json(client);
  } catch (error) {
    next(error);
  }
});

export default router;
