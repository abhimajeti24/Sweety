// Optional Redis cache for report payloads (bonus B6). With REDIS_URL empty every function is a
// no-op and get() returns null, so the app works without Redis. If Redis fails at runtime the
// error is logged once and requests fall through to the database: the cache never breaks the app.
//
// Invalidation by version: each user has a counter at report-version:{userId}, and report keys
// include it (report:{userId}:v{version}:{date}). Any reading change bumps the counter, so old
// keys are simply never read again and expire by TTL. No scanning or deleting of keys is needed.
import Redis from 'ioredis';
import { config } from '../config.js';
import { logger } from './logger.js';

/**
 * Builds the cache around a Redis-like client (anything with get, set, incr and ping).
 * Exported so tests can pass an in-memory stand-in.
 * @param {import('ioredis').Redis | null} client null disables the cache
 * @param {{ ttlSeconds: number }} options
 */
export function createCache(client, { ttlSeconds }) {
  let failing = false;

  async function safely(operation, fallback) {
    if (!client) return fallback;
    try {
      const result = await operation();
      if (failing) logger.info('Redis is reachable again; report cache back on');
      failing = false;
      return result;
    } catch (error) {
      if (!failing)
        logger.warn({ err: error }, 'Redis unavailable; serving reports from the database');
      failing = true;
      return fallback;
    }
  }

  const versionKey = (userId) => `report-version:${userId}`;

  return {
    enabled: Boolean(client),

    /** The cache key for a user's reports on a date, or null when caching is off or failing. */
    reportKey(userId, selectedDate) {
      return safely(async () => {
        const version = (await client.get(versionKey(userId))) ?? '0';
        return `report:${userId}:v${version}:${selectedDate}`;
      }, null);
    },

    /** @returns {Promise<any | null>} the parsed value, or null on a miss */
    get(key) {
      if (!key) return Promise.resolve(null);
      return safely(async () => {
        const raw = await client.get(key);
        return raw === null ? null : JSON.parse(raw);
      }, null);
    },

    set(key, value, ttl = ttlSeconds) {
      if (!key) return Promise.resolve();
      return safely(() => client.set(key, JSON.stringify(value), 'EX', ttl), undefined);
    },

    /** Makes every cached report of this user unreachable. Call after a reading changes. */
    bumpUserVersion(userId) {
      return safely(() => client.incr(versionKey(userId)), undefined);
    },

    /** 'ok', 'error' or 'disabled', for the health check. */
    async status() {
      if (!client) return 'disabled';
      try {
        await client.ping();
        return 'ok';
      } catch {
        return 'error';
      }
    },

    async close() {
      if (client) await client.quit().catch(() => {});
    },
  };
}

function connect(url) {
  if (!url) return null;
  const client = new Redis(url, {
    // Fail fast while Redis is down instead of queueing commands and hanging the request.
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
  });
  // Connection errors are reported through safely(); this listener stops ioredis from
  // printing an unhandled 'error' event on every reconnect attempt.
  client.on('error', () => {});
  return client;
}

export const cache = createCache(connect(config.redisUrl), {
  ttlSeconds: config.reportCacheTtlSeconds,
});
