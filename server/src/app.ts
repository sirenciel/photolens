import express from 'express';
import cors from 'cors';
import createError from 'http-errors';
import {
  bookingRouter,
  clientRouter,
  editingJobRouter,
  editingStatusRouter,
  expenseRouter,
  invoiceRouter,
  paymentAccountRouter,
  sessionCategoryRouter,
  sessionPackageRouter,
  staffRouter,
} from './modules';

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/clients', clientRouter);
  app.use('/api/staff', staffRouter);
  app.use('/api/session-categories', sessionCategoryRouter);
  app.use('/api/session-packages', sessionPackageRouter);
  app.use('/api/payment-accounts', paymentAccountRouter);
  app.use('/api/expenses', expenseRouter);
  app.use('/api/editing-statuses', editingStatusRouter);
  app.use('/api/editing-jobs', editingJobRouter);
  app.use('/api/bookings', bookingRouter);
  app.use('/api/invoices', invoiceRouter);

  app.use((_req, _res, next) => {
    next(new createError.NotFound('Route not found'));
  });

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err.name === 'ZodError') {
      res.status(400).json({ message: 'Validation failed', details: err.errors });
      return;
    }

    const status = err.status || 500;
    res.status(status).json({
      message: err.message || 'Internal Server Error',
    });
  });

  return app;
};
