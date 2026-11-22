// The single PostgreSQL connection pool, plus small helpers for queries and transactions.
import pg from 'pg';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';

// Return DATE columns as 'YYYY-MM-DD' strings. Without this, pg converts them
// to JS Date objects at local midnight, which shifts the day in some timezones.
const DATE_TYPE_OID = 1082;
pg.types.setTypeParser(DATE_TYPE_OID, (value) => value);

export const pool = new pg.Pool({ connectionString: config.databaseUrl, max: 10 });

// An idle client can lose its connection (for example when Postgres restarts). Log it instead of crashing.
pool.on('error', (error) => {
  logger.error({ err: error }, 'Unexpected error on an idle PostgreSQL client');
});

/**
 * Runs `work` inside BEGIN/COMMIT on one client, rolling back if it throws.
 * @template T
 * @param {(client: pg.PoolClient) => Promise<T>} work
 * @returns {Promise<T>}
 */
export async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
