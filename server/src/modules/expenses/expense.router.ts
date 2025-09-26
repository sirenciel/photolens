import { Router } from 'express';
import { expenseService } from './expense.service';
import { expenseSchema, expenseUpdateSchema } from './expense.validation';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const expenses = await expenseService.list();
    res.json(expenses);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const expense = await expenseService.getById(req.params.id);
    res.json(expense);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = expenseSchema.parse(req.body);
    const expense = await expenseService.create({
      ...payload,
      date: payload.date,
    });
    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = expenseUpdateSchema.parse(req.body);
    const expense = await expenseService.update(req.params.id, payload);
    res.json(expense);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await expenseService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
