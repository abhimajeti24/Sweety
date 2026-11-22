// Drops every table and type, then re-runs all migrations. For development only:
// it refuses to run when NODE_ENV is production.
import { pathToFileURL } from 'node:url';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';
import { migrate } from './migrate.js';
import { pool } from './pool.js';

/**
 * Empties the schema and migrates it again.
 * @param {import('pg').Pool} [db]
 */
export async function resetDatabase(db = pool) {
  if (config.isProduction) {
    throw new Error('Refusing to reset the database while NODE_ENV is production.');
  }
  await db.query('DROP SCHEMA public CASCADE');
  await db.query('CREATE SCHEMA public');
  await migrate(db);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await resetDatabase();
    logger.info('Database reset');
  } finally {
    await pool.end();
  }
}
