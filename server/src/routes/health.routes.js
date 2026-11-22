// /api/health: a quick check that the API and its database are reachable.
import { Router } from 'express';
import { pool } from '../db/pool.js';

export const healthRoutes = Router();

healthRoutes.get('/', async (req, res) => {
  let db = 'ok';
  try {
    await pool.query('SELECT 1');
  } catch (error) {
    req.log.error({ err: error }, 'Health check: database unreachable');
    db = 'error';
  }
  const healthy = db === 'ok';
  res.status(healthy ? 200 : 503).json({ status: healthy ? 'ok' : 'error', db, redis: 'disabled' });
});
