import { addDays } from '@sweety/shared';
import { beforeEach, describe, expect, it } from 'vitest';
import { addReading, createUserAndLogin } from './helpers.js';

const SLOTS = ['morning_fasting', 'after_breakfast', 'after_lunch', 'after_dinner'];

describe('GET /api/readings pagination', () => {
  let agent;

  beforeEach(async () => {
    ({ agent } = await createUserAndLogin());
    // 25 readings: six full days back from 2026-10-15 plus one reading on 2026-10-09.
    for (let index = 0; index < 25; index += 1) {
      const date = addDays('2026-10-15', -Math.floor(index / 4));
      await addReading(agent, { date, slot: SLOTS[index % 4], value: 100 + index }).expect(201);
    }
  });

  it('returns the last partial page', async () => {
    const response = await agent.get('/api/readings?limit=10&page=3').expect(200);
    expect(response.body.data).toHaveLength(5);
    expect(response.body.pagination).toEqual({ page: 3, limit: 10, total: 25, totalPages: 3 });
  });

  it('defaults to page 1 with 20 per page, newest first', async () => {
    const response = await agent.get('/api/readings').expect(200);
    expect(response.body.data).toHaveLength(20);
    expect(response.body.data[0]).toMatchObject({ date: '2026-10-15', slot: 'morning_fasting' });
    expect(response.body.pagination).toEqual({ page: 1, limit: 20, total: 25, totalPages: 2 });
  });

  it('returns an empty page past the end', async () => {
    const response = await agent.get('/api/readings?page=9').expect(200);
    expect(response.body.data).toEqual([]);
  });

  it.each(['limit=0', 'limit=101', 'limit=abc', 'page=0', 'page=-1', 'page=1.5'])(
    'rejects %s',
    async (query) => {
      const response = await agent.get(`/api/readings?${query}`).expect(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    },
  );
});
