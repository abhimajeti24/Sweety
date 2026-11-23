// Runs before every server test file: bring the test database schema up to date once,
// then start each test from empty tables (and, when a test Redis is configured, an empty cache,
// because user ids restart at 1 in every test and cached reports would otherwise leak between tests).
import Redis from 'ioredis';
import { afterAll, beforeAll, beforeEach } from 'vitest';
import { config } from '../src/config.js';
import { migrate } from '../src/db/migrate.js';
import { pool } from '../src/db/pool.js';
import { cache } from '../src/lib/cache.js';

const testRedis = config.redisUrl ? new Redis(config.redisUrl) : null;

beforeAll(async () => {
  await migrate();
});

beforeEach(async () => {
  await pool.query('TRUNCATE users, readings, doctor_patients RESTART IDENTITY CASCADE');
  await testRedis?.flushdb();
});

afterAll(async () => {
  await pool.end();
  await cache.close();
  await testRedis?.quit();
});
