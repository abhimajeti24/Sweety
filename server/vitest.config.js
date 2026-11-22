// Server tests run against a real PostgreSQL test database, one file at a time,
// because every test truncates the shared tables.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: { NODE_ENV: 'test', BCRYPT_ROUNDS: '4', LOG_LEVEL: 'silent' },
    setupFiles: ['./test/setup.js'],
    fileParallelism: false,
    hookTimeout: 30_000,
  },
});
