// Applies migrations/*.sql in file-name order, each in its own transaction, and records
// which ones ran in schema_migrations so running it again is a no-op.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { logger } from '../lib/logger.js';
import { pool } from './pool.js';

const MIGRATIONS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');

async function listMigrationFiles() {
  const files = await readdir(MIGRATIONS_DIR);
  return files.filter((file) => file.endsWith('.sql')).sort();
}

async function listAppliedVersions(db) {
  const { rows } = await db.query('SELECT version FROM schema_migrations');
  return new Set(rows.map((row) => row.version));
}

/**
 * Brings the database schema up to date.
 * @param {import('pg').Pool} [db]
 * @returns {Promise<string[]>} the versions applied by this run
 */
export async function migrate(db = pool) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const applied = await listAppliedVersions(db);
  const pending = (await listMigrationFiles()).filter((file) => !applied.has(file));

  for (const file of pending) {
    const sql = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
      await client.query('COMMIT');
      logger.info({ migration: file }, 'Applied migration');
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Migration ${file} failed: ${error.message}`, { cause: error });
    } finally {
      client.release();
    }
  }

  return pending;
}

// Run directly with `npm run db:migrate`.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const applied = await migrate();
    logger.info(
      applied.length ? `Applied ${applied.length} migration(s)` : 'Database already up to date',
    );
  } finally {
    await pool.end();
  }
}
