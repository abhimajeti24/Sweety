// /api/readings: list, get, add, edit and delete the logged-in patient's readings.
// Mounted behind requireAuth and requireRole('patient') in app.js.
import { Router } from 'express';
import { MESSAGES } from '@sweety/shared';
import { AppError } from '../lib/AppError.js';
import { parseId } from '../lib/params.js';
import * as readingsService from '../services/readings.service.js';

export const readingsRoutes = Router();

function readingIdFrom(req) {
  const id = parseId(req.params.id);
  if (id === null) throw AppError.notFound(MESSAGES.readingNotFound);
  return id;
}

readingsRoutes.get('/', async (req, res) => {
  res.json(await readingsService.listReadings(req.user.id, req.query));
});

readingsRoutes.get('/:id', async (req, res) => {
  const reading = await readingsService.getReading(req.user.id, readingIdFrom(req));
  res.json({ reading });
});

readingsRoutes.post('/', async (req, res) => {
  const reading = await readingsService.createReading(req.user.id, req.body, req.today);
  res.status(201).json({ reading });
});

readingsRoutes.put('/:id', async (req, res) => {
  const id = readingIdFrom(req);
  const reading = await readingsService.updateReading(req.user.id, id, req.body, req.today);
  res.json({ reading });
});

readingsRoutes.delete('/:id', async (req, res) => {
  await readingsService.deleteReading(req.user.id, readingIdFrom(req));
  res.status(204).end();
});
