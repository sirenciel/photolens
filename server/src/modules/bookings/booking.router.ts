import { Router } from 'express';
import { bookingService } from './booking.service';
import { bookingSchema, bookingUpdateSchema } from './booking.validation';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const bookings = await bookingService.list();
    res.json(bookings);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const booking = await bookingService.getById(req.params.id);
    res.json(booking);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = bookingSchema.parse(req.body);
    const booking = await bookingService.create(payload);
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = bookingUpdateSchema.parse(req.body);
    const booking = await bookingService.update(req.params.id, payload);
    res.json(booking);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await bookingService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
