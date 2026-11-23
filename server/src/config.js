// Reads environment variables once, checks them and exposes a typed config object.
// A bad setting stops the server at startup with a clear message instead of failing later.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { isValidTimeZone } from '@sweety/shared';

// One .env at the repository root serves the server, the client and Docker Compose.
const rootEnvPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env');
dotenv.config({ path: rootEnvPath, quiet: true });

const MIN_SECRET_LENGTH = 32;

function readInteger(value, fallback) {
  if (value === undefined || value === '') return fallback;
  return Number(value);
}

/**
 * Builds the config from an environment object. Throws with every problem listed when invalid.
 * Exported separately so it can be tested without touching process.env.
 * @param {NodeJS.ProcessEnv} env
 */
export function buildConfig(env) {
  const nodeEnv = env.NODE_ENV || 'development';
  const isTest = nodeEnv === 'test';
  const problems = [];

  const databaseUrl = isTest ? env.DATABASE_URL_TEST : env.DATABASE_URL;
  if (!databaseUrl) {
    problems.push(
      isTest ? 'DATABASE_URL_TEST is required to run tests.' : 'DATABASE_URL is required.',
    );
  }
  if (isTest && databaseUrl && databaseUrl === env.DATABASE_URL) {
    problems.push('DATABASE_URL_TEST must point to a different database than DATABASE_URL.');
  }
  // The tests flush their Redis before every test, so it must never be the app's Redis database.
  if (isTest && env.REDIS_URL_TEST && env.REDIS_URL_TEST === env.REDIS_URL) {
    problems.push('REDIS_URL_TEST must point to a different Redis database than REDIS_URL.');
  }

  const jwtSecret = env.JWT_SECRET ?? '';
  if (jwtSecret.length < MIN_SECRET_LENGTH) {
    problems.push(`JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters.`);
  }

  const bcryptRounds = readInteger(env.BCRYPT_ROUNDS, 12);
  if (!Number.isInteger(bcryptRounds) || bcryptRounds < 4 || bcryptRounds > 15) {
    problems.push('BCRYPT_ROUNDS must be a whole number from 4 to 15.');
  }

  const appTimeZone = env.APP_TIMEZONE || 'Asia/Kolkata';
  if (!isValidTimeZone(appTimeZone)) {
    problems.push(`APP_TIMEZONE "${appTimeZone}" is not a valid IANA timezone.`);
  }

  const port = readInteger(env.PORT, 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    problems.push('PORT must be a whole number from 1 to 65535.');
  }

  const reportCacheTtlSeconds = readInteger(env.REPORT_CACHE_TTL_SECONDS, 300);
  if (!Number.isInteger(reportCacheTtlSeconds) || reportCacheTtlSeconds < 1) {
    problems.push('REPORT_CACHE_TTL_SECONDS must be a whole number of 1 or more.');
  }

  if (problems.length > 0) {
    throw new Error(`Invalid configuration:\n  - ${problems.join('\n  - ')}`);
  }

  const redisUrl = (isTest ? env.REDIS_URL_TEST : env.REDIS_URL) || null;

  return Object.freeze({
    nodeEnv,
    isTest,
    isProduction: nodeEnv === 'production',
    port,
    clientOrigin: env.CLIENT_ORIGIN || 'http://localhost:5173',
    appTimeZone,
    logLevel: env.LOG_LEVEL || (isTest ? 'silent' : 'info'),
    databaseUrl,
    jwtSecret,
    jwtExpiresIn: env.JWT_EXPIRES_IN || '7d',
    bcryptRounds,
    cookieSecure: env.COOKIE_SECURE === 'true',
    redisUrl,
    reportCacheTtlSeconds,
    reminderCron: env.REMINDER_CRON || '0 20 * * *',
  });
}

function loadConfig() {
  try {
    return buildConfig(process.env);
  } catch (error) {
    // The logger depends on config, so write straight to stderr here.
    process.stderr.write(`${error.message}\nCopy .env.example to .env and fix the values above.\n`);
    process.exit(1);
  }
}

export const config = loadConfig();
