import { Router } from 'express';
import { invoiceService } from './invoice.service';
import { invoiceSchema, invoiceUpdateSchema, paymentSchema } from './invoice.validation';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const invoices = await invoiceService.list();
    res.json(invoices);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const invoice = await invoiceService.getById(req.params.id);
    res.json(invoice);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = invoiceSchema.parse(req.body);
    const invoice = await invoiceService.create(payload);
    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = invoiceUpdateSchema.parse(req.body);
    const invoice = await invoiceService.update(req.params.id, payload);
    res.json(invoice);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/payments', async (req, res, next) => {
  try {
    const payload = paymentSchema.parse(req.body);
    const invoice = await invoiceService.addPayment(req.params.id, payload);
    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await invoiceService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
