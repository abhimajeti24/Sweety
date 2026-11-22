import { addDays, todayInTimeZone } from '@sweety/shared';
import { describe, expect, it } from 'vitest';
import { TIME_ZONE, addReading, createUserAndLogin } from './helpers.js';

const getReport = (agent, date) =>
  agent.get(`/api/reports${date ? `?date=${date}` : ''}`).set('X-Timezone', TIME_ZONE);

const EMPTY_STATS = { count: 0, highest: null, lowest: null, average: null };

describe('GET /api/reports', () => {
  it('uses the ranges from the brief for 15 Oct 2026', async () => {
    const { agent } = await createUserAndLogin();
    const response = await getReport(agent, '2026-10-15').expect(200);
    expect(response.body.selectedDate).toBe('2026-10-15');
    expect(response.body.daily.range).toEqual({ from: '2026-10-15', to: '2026-10-15' });
    expect(response.body.monthToDate.range).toEqual({ from: '2026-10-01', to: '2026-10-15' });
    expect(response.body.monthly.range).toEqual({ from: '2026-09-01', to: '2026-09-30' });
  });

  it('computes highest, lowest, count and a one-decimal average', async () => {
    const { agent } = await createUserAndLogin();
    await addReading(agent, { date: '2026-10-15', slot: 'morning_fasting', value: 100 });
    await addReading(agent, { date: '2026-10-15', slot: 'after_breakfast', value: 101 });
    await addReading(agent, { date: '2026-10-15', slot: 'after_lunch', value: 101 });

    const response = await getReport(agent, '2026-10-15').expect(200);
    expect(response.body.daily.stats).toEqual({
      count: 3,
      highest: 101,
      lowest: 100,
      average: 100.7,
    });
  });

  it('rounds a half away from zero (100.25 becomes 100.3)', async () => {
    const { agent } = await createUserAndLogin();
    const values = [100, 100, 100, 101];
    const slots = ['morning_fasting', 'after_breakfast', 'after_lunch', 'after_dinner'];
    for (const [index, value] of values.entries()) {
      await addReading(agent, { date: '2026-10-15', slot: slots[index], value }).expect(201);
    }
    const response = await getReport(agent, '2026-10-15').expect(200);
    expect(response.body.daily.stats.average).toBe(100.3);
  });

  it('lists the day readings in slot order with labels', async () => {
    const { agent } = await createUserAndLogin();
    await addReading(agent, { date: '2026-10-15', slot: 'after_dinner', value: 182 });
    await addReading(agent, { date: '2026-10-15', slot: 'morning_fasting', value: 96 });

    const response = await getReport(agent, '2026-10-15').expect(200);
    expect(response.body.daily.readings).toEqual([
      {
        id: 2,
        date: '2026-10-15',
        slot: 'morning_fasting',
        slotLabel: 'Morning (fasting)',
        value: 96,
      },
      { id: 1, date: '2026-10-15', slot: 'after_dinner', slotLabel: 'After dinner', value: 182 },
    ]);
  });

  it('puts the last day of the previous month in Monthly only, and the 1st in Month-to-date', async () => {
    const { agent } = await createUserAndLogin();
    await addReading(agent, { date: '2026-09-30', slot: 'after_lunch', value: 200 });
    await addReading(agent, { date: '2026-10-01', slot: 'after_lunch', value: 120 });
    await addReading(agent, { date: '2026-10-16', slot: 'after_lunch', value: 300 });

    const { body } = await getReport(agent, '2026-10-15').expect(200);
    expect(body.monthly.stats).toEqual({ count: 1, highest: 200, lowest: 200, average: 200 });
    expect(body.monthToDate.stats).toEqual({
      count: 1,
      highest: 120,
      lowest: 120,
      average: 120,
    });
    expect(body.daily.stats).toEqual(EMPTY_STATS);
  });

  it('returns count 0 and nulls when there are no readings', async () => {
    const { agent } = await createUserAndLogin();
    const { body } = await getReport(agent, '2026-10-15').expect(200);
    expect(body.daily).toEqual({
      range: { from: '2026-10-15', to: '2026-10-15' },
      stats: EMPTY_STATS,
      readings: [],
    });
    expect(body.monthToDate.stats).toEqual(EMPTY_STATS);
    expect(body.monthly.stats).toEqual(EMPTY_STATS);
  });

  it('only counts the logged-in user readings', async () => {
    const owner = await createUserAndLogin();
    const other = await createUserAndLogin();
    await addReading(owner.agent, { date: '2026-10-15', slot: 'after_lunch', value: 150 });
    const { body } = await getReport(other.agent, '2026-10-15').expect(200);
    expect(body.daily.stats.count).toBe(0);
  });

  it('defaults to today in the user timezone', async () => {
    const { agent } = await createUserAndLogin();
    const { body } = await getReport(agent).expect(200);
    expect(body.selectedDate).toBe(todayInTimeZone(TIME_ZONE));
  });

  it('rejects a future date and an invalid date', async () => {
    const { agent } = await createUserAndLogin();
    const future = await getReport(agent, addDays(todayInTimeZone(TIME_ZONE), 1)).expect(400);
    expect(future.body.error.message).toBe('Date cannot be in the future.');
    const invalid = await getReport(agent, '2026-02-30').expect(400);
    expect(invalid.body.error.message).toBe('Please enter a valid date.');
  });
});

describe('GET /api/reports/series', () => {
  it('returns the month readings oldest first', async () => {
    const { agent } = await createUserAndLogin();
    await addReading(agent, { date: '2026-10-20', slot: 'after_lunch', value: 150 });
    await addReading(agent, { date: '2026-10-02', slot: 'after_dinner', value: 140 });
    await addReading(agent, { date: '2026-10-02', slot: 'morning_fasting', value: 95 });
    await addReading(agent, { date: '2026-09-30', slot: 'after_lunch', value: 160 });

    const response = await agent.get('/api/reports/series?month=2026-10').expect(200);
    expect(response.body.map((reading) => [reading.date, reading.slot, reading.value])).toEqual([
      ['2026-10-02', 'morning_fasting', 95],
      ['2026-10-02', 'after_dinner', 140],
      ['2026-10-20', 'after_lunch', 150],
    ]);
  });

  it('rejects a malformed month', async () => {
    const { agent } = await createUserAndLogin();
    await agent.get('/api/reports/series?month=2026-13').expect(400);
  });
});
