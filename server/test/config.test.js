import { describe, expect, it } from 'vitest';
import { buildConfig } from '../src/config.js';

const validEnv = {
  NODE_ENV: 'development',
  DATABASE_URL: 'postgres://localhost/sweety',
  JWT_SECRET: 'x'.repeat(32),
};

describe('buildConfig', () => {
  it('fills in defaults', () => {
    const config = buildConfig(validEnv);
    expect(config).toMatchObject({
      port: 4000,
      appTimeZone: 'Asia/Kolkata',
      bcryptRounds: 12,
      cookieSecure: false,
      redisUrl: null,
    });
  });

  it('lists every problem at once', () => {
    expect(() =>
      buildConfig({
        NODE_ENV: 'development',
        JWT_SECRET: 'short',
        BCRYPT_ROUNDS: '20',
        APP_TIMEZONE: 'Mars/Base',
      }),
    ).toThrow(
      /DATABASE_URL is required[\s\S]*JWT_SECRET[\s\S]*BCRYPT_ROUNDS[\s\S]*APP_TIMEZONE "Mars\/Base"/,
    );
  });

  it('refuses to run tests against the main database', () => {
    expect(() =>
      buildConfig({ ...validEnv, NODE_ENV: 'test', DATABASE_URL_TEST: validEnv.DATABASE_URL }),
    ).toThrow(/different database/);
  });
});
