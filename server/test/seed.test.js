import { describe, expect, it } from 'vitest';
import { pool } from '../src/db/pool.js';
import { buildDemoReadings, seed } from '../src/db/seed.js';

const TODAY = '2026-11-23';

async function countRows() {
  const { rows } = await pool.query(
    `SELECT (SELECT COUNT(*)::int FROM users) AS users,
            (SELECT COUNT(*)::int FROM readings) AS readings`,
  );
  return rows[0];
}

describe('seed', () => {
  it('is idempotent: running it twice gives the same data', async () => {
    await seed({ today: TODAY });
    const first = await countRows();
    await seed({ today: TODAY });
    expect(await countRows()).toEqual(first);
    expect(first.users).toBe(2);
  });

  it('leaves exactly two readings today for the demo patient', async () => {
    const { demo } = await seed({ today: TODAY });
    const { rows } = await pool.query(
      'SELECT slot FROM readings WHERE user_id = $1 AND reading_date = $2 ORDER BY slot',
      [demo, TODAY],
    );
    expect(rows.map((row) => row.slot)).toEqual(['morning_fasting', 'after_breakfast']);
  });

  it('covers the previous month and keeps every value inside 40 to 600', () => {
    const readings = buildDemoReadings(TODAY);
    expect(readings[0].date).toBe('2026-10-01');
    expect(readings.every((reading) => reading.value >= 40 && reading.value <= 600)).toBe(true);
    expect(buildDemoReadings(TODAY)).toEqual(readings);
  });
});
