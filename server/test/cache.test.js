import Redis from 'ioredis';
import { describe, expect, it, vi } from 'vitest';
import { createCache } from '../src/lib/cache.js';

// Just enough of the Redis API for the cache: an in-memory stand-in for tests. Defined inside
// vi.hoisted so the module mock below (which runs before imports) can use it too.
const { createFakeRedis, fake } = vi.hoisted(() => {
  function createFakeRedis() {
    const store = new Map();
    return {
      store,
      get: async (key) => (store.has(key) ? store.get(key) : null),
      set: async (key, value) => {
        store.set(key, value);
        return 'OK';
      },
      incr: async (key) => {
        const next = Number(store.get(key) ?? 0) + 1;
        store.set(key, String(next));
        return next;
      },
      ping: async () => 'PONG',
      quit: async () => {},
    };
  }
  return { createFakeRedis, fake: { redis: null } };
});

// The app's cache singleton, backed by the stand-in, for the wiring test further down.
vi.mock('../src/lib/cache.js', async (importOriginal) => {
  const actual = await importOriginal();
  fake.redis = createFakeRedis();
  return { ...actual, cache: actual.createCache(fake.redis, { ttlSeconds: 60 }) };
});

describe('createCache', () => {
  it('is a harmless no-op when Redis is not configured', async () => {
    const cache = createCache(null, { ttlSeconds: 60 });
    expect(await cache.reportKey(1, '2026-10-15')).toBeNull();
    expect(await cache.get('anything')).toBeNull();
    await expect(cache.set('k', { a: 1 })).resolves.toBeUndefined();
    await expect(cache.bumpUserVersion(1)).resolves.toBeUndefined();
    expect(await cache.status()).toBe('disabled');
  });

  it('stores and returns JSON under a versioned key', async () => {
    const cache = createCache(createFakeRedis(), { ttlSeconds: 60 });
    const key = await cache.reportKey(7, '2026-10-15');
    expect(key).toBe('report:7:v0:2026-10-15');
    await cache.set(key, { daily: { count: 2 } });
    expect(await cache.get(key)).toEqual({ daily: { count: 2 } });
  });

  it('makes old entries unreachable when the user version is bumped', async () => {
    const cache = createCache(createFakeRedis(), { ttlSeconds: 60 });
    const before = await cache.reportKey(7, '2026-10-15');
    await cache.set(before, { stale: true });
    await cache.bumpUserVersion(7);
    const after = await cache.reportKey(7, '2026-10-15');
    expect(after).toBe('report:7:v1:2026-10-15');
    expect(await cache.get(after)).toBeNull();
    // Other users are untouched.
    expect(await cache.reportKey(8, '2026-10-15')).toBe('report:8:v0:2026-10-15');
  });

  it('falls back quietly when Redis errors at runtime', async () => {
    const broken = {
      get: () => Promise.reject(new Error('ECONNREFUSED')),
      set: () => Promise.reject(new Error('ECONNREFUSED')),
      incr: () => Promise.reject(new Error('ECONNREFUSED')),
      ping: () => Promise.reject(new Error('ECONNREFUSED')),
    };
    const cache = createCache(broken, { ttlSeconds: 60 });
    expect(await cache.reportKey(1, '2026-10-15')).toBeNull();
    await expect(cache.bumpUserVersion(1)).resolves.toBeUndefined();
    expect(await cache.status()).toBe('error');
  });
});

describe('report caching through the API', () => {
  it('serves a repeat report from the cache and refreshes it after a reading changes', async () => {
    const { addReading, createUserAndLogin } = await import('./helpers.js');
    const { pool } = await import('../src/db/pool.js');
    const { agent, user } = await createUserAndLogin();
    const getDaily = async () =>
      (await agent.get('/api/reports?date=2026-10-15').expect(200)).body.daily.stats.count;

    await addReading(agent, { date: '2026-10-15', slot: 'morning_fasting', value: 100 });
    expect(await getDaily()).toBe(1);

    // A row written behind the service's back does not bump the version: the cached copy wins.
    await pool.query(
      `INSERT INTO readings (user_id, reading_date, slot, value_mg_dl)
       VALUES ($1, '2026-10-15', 'after_breakfast', 150)`,
      [user.id],
    );
    expect(await getDaily()).toBe(1);

    // A change through the API bumps the version, so the next report is rebuilt.
    await addReading(agent, { date: '2026-10-15', slot: 'after_lunch', value: 160 });
    expect(await getDaily()).toBe(3);
    expect([...fake.redis.store.keys()].some((key) => key.startsWith('report:'))).toBe(true);
  });
});

describe.skipIf(!process.env.REDIS_URL_TEST)('against a real Redis (REDIS_URL_TEST)', () => {
  it('round-trips and bumps versions', async () => {
    const client = new Redis(process.env.REDIS_URL_TEST);
    const cache = createCache(client, { ttlSeconds: 30 });
    const userId = Date.now();
    const key = await cache.reportKey(userId, '2026-10-15');
    await cache.set(key, { ok: true });
    expect(await cache.get(key)).toEqual({ ok: true });
    await cache.bumpUserVersion(userId);
    expect(await cache.get(await cache.reportKey(userId, '2026-10-15'))).toBeNull();
    expect(await cache.status()).toBe('ok');
    await cache.close();
  });
});
