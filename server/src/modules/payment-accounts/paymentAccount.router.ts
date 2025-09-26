import { Router } from 'express';
import { paymentAccountService } from './paymentAccount.service';
import {
  paymentAccountSchema,
  paymentAccountUpdateSchema,
} from './paymentAccount.validation';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const accounts = await paymentAccountService.list();
    res.json(accounts);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const account = await paymentAccountService.getById(req.params.id);
    res.json(account);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = paymentAccountSchema.parse(req.body);
    const account = await paymentAccountService.create(payload);
    res.status(201).json(account);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = paymentAccountUpdateSchema.parse(req.body);
    const account = await paymentAccountService.update(req.params.id, payload);
    res.json(account);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await paymentAccountService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
