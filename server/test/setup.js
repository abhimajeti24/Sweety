// Runs before every server test file: bring the test database schema up to date once,
// then start each test from empty tables.
import { afterAll, beforeAll, beforeEach } from 'vitest';
import { migrate } from '../src/db/migrate.js';
import { pool } from '../src/db/pool.js';

beforeAll(async () => {
  await migrate();
});

beforeEach(async () => {
  await pool.query('TRUNCATE users, readings RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  await pool.end();
});
