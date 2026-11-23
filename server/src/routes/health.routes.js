// /api/health: a quick check that the API, its database and (when enabled) Redis are reachable.
// Redis being down does not make the app unhealthy, because the cache is optional.
import { Router } from 'express';
import { pool } from '../db/pool.js';
import { cache } from '../lib/cache.js';

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
  const redis = await cache.status();
  res.status(healthy ? 200 : 503).json({ status: healthy ? 'ok' : 'error', db, redis });
});
