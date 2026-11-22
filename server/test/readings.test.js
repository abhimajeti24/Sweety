import request from 'supertest';
import { addDays, todayInTimeZone } from '@sweety/shared';
import { describe, expect, it } from 'vitest';
import { TIME_ZONE, addReading, app, createUserAndLogin } from './helpers.js';

const DAY = '2026-10-15';
const lunch = { date: DAY, slot: 'after_lunch', value: 142 };

async function fillDay(agent, date) {
  const slots = ['morning_fasting', 'after_breakfast', 'after_lunch', 'after_dinner'];
  const created = [];
  for (const [index, slot] of slots.entries()) {
    const response = await addReading(agent, { date, slot, value: 100 + index }).expect(201);
    created.push(response.body.reading);
  }
  return created;
}

describe('authentication', () => {
  it('rejects every readings route without a session', async () => {
    const response = await request(app).get('/api/readings').expect(401);
    expect(response.body.error).toEqual({
      code: 'UNAUTHENTICATED',
      message: 'Please log in to continue.',
    });
    await request(app).post('/api/readings').send(lunch).expect(401);
  });
});

describe('POST /api/readings', () => {
  it('adds a reading and returns it in the API shape', async () => {
    const { agent } = await createUserAndLogin();
    const response = await addReading(agent, { ...lunch, value: '0142' }).expect(201);
    expect(response.body).toEqual({
      reading: { id: 1, date: DAY, slot: 'after_lunch', slotLabel: 'After lunch', value: 142 },
    });
  });

  it('rejects a second reading in the same slot on the same date', async () => {
    const { agent } = await createUserAndLogin();
    await addReading(agent, lunch).expect(201);
    const response = await addReading(agent, { ...lunch, value: 150 }).expect(409);
    expect(response.body.error).toEqual({
      code: 'DUPLICATE_SLOT',
      message: 'You already have an After lunch reading for this date.',
      fields: { slot: 'You already have an After lunch reading for this date.' },
    });
  });

  it('uses "a" for the fasting slot', async () => {
    const { agent } = await createUserAndLogin();
    const fasting = { date: DAY, slot: 'morning_fasting', value: 95 };
    await addReading(agent, fasting).expect(201);
    const response = await addReading(agent, fasting).expect(409);
    expect(response.body.error.message).toBe(
      'You already have a Morning (fasting) reading for this date.',
    );
  });

  it('allows the same slot on a different date', async () => {
    const { agent } = await createUserAndLogin();
    await addReading(agent, lunch).expect(201);
    await addReading(agent, { ...lunch, date: '2026-10-14' }).expect(201);
  });

  it('rejects a fifth reading on a day with the daily limit message', async () => {
    const { agent } = await createUserAndLogin();
    await fillDay(agent, DAY);
    const response = await addReading(agent, lunch).expect(409);
    expect(response.body.error).toEqual({
      code: 'DAILY_LIMIT',
      message: 'You can add only 4 readings per day.',
      fields: { date: 'You can add only 4 readings per day.' },
    });
  });

  it('rejects a date after today in the user timezone', async () => {
    const { agent } = await createUserAndLogin();
    const tomorrow = addDays(todayInTimeZone(TIME_ZONE), 1);
    const response = await addReading(agent, { ...lunch, date: tomorrow }).expect(400);
    expect(response.body.error.fields).toEqual({ date: 'Date cannot be in the future.' });
    expect(response.body.error.message).toBe('Date cannot be in the future.');
  });

  it('decides "today" from the X-Timezone header', async () => {
    // Kiritimati (UTC+14) is always exactly one calendar day ahead of Honolulu (UTC-10).
    const { agent } = await createUserAndLogin();
    const kiritimatiToday = todayInTimeZone('Pacific/Kiritimati');
    const reading = { ...lunch, date: kiritimatiToday };

    await agent
      .post('/api/readings')
      .set('X-Timezone', 'Pacific/Honolulu')
      .send(reading)
      .expect(400);
    await agent
      .post('/api/readings')
      .set('X-Timezone', 'Pacific/Kiritimati')
      .send(reading)
      .expect(201);
  });

  it.each([
    [undefined, 'Please enter a glucose value.'],
    ['', 'Please enter a glucose value.'],
    [39, 'Value must be between 40 and 600 mg/dl.'],
    [601, 'Value must be between 40 and 600 mg/dl.'],
    [120.5, 'Value must be between 40 and 600 mg/dl.'],
    ['abc', 'Value must be between 40 and 600 mg/dl.'],
  ])('answers value %j with "%s"', async (value, message) => {
    const { agent } = await createUserAndLogin();
    const response = await addReading(agent, { ...lunch, value }).expect(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.fields).toEqual({ value: message });
  });

  it('accepts the boundary values 40 and 600', async () => {
    const { agent } = await createUserAndLogin();
    await addReading(agent, { ...lunch, value: 40 }).expect(201);
    await addReading(agent, { ...lunch, slot: 'after_dinner', value: 600 }).expect(201);
  });

  it('reports every field problem together', async () => {
    const { agent } = await createUserAndLogin();
    const response = await addReading(agent, {}).expect(400);
    expect(response.body.error.message).toBe('Please fix the highlighted fields.');
    expect(Object.keys(response.body.error.fields).sort()).toEqual(['date', 'slot', 'value']);
  });
});

describe('isolation between users', () => {
  it('never shows or changes another user reading', async () => {
    const owner = await createUserAndLogin();
    const other = await createUserAndLogin();
    const { reading } = (await addReading(owner.agent, lunch).expect(201)).body;

    const list = await other.agent.get('/api/readings').expect(200);
    expect(list.body.data).toEqual([]);

    await other.agent.get(`/api/readings/${reading.id}`).expect(404);
    await other.agent
      .put(`/api/readings/${reading.id}`)
      .set('X-Timezone', TIME_ZONE)
      .send({ ...lunch, value: 99 })
      .expect(404);
    const removal = await other.agent.delete(`/api/readings/${reading.id}`).expect(404);
    expect(removal.body.error.message).toBe('Reading not found.');

    const stillThere = await owner.agent.get(`/api/readings/${reading.id}`).expect(200);
    expect(stillThere.body.reading.value).toBe(142);
  });
});

describe('PUT /api/readings/:id', () => {
  const put = (agent, id, body) =>
    agent.put(`/api/readings/${id}`).set('X-Timezone', TIME_ZONE).send(body);

  it('saves an unchanged reading', async () => {
    const { agent } = await createUserAndLogin();
    const { reading } = (await addReading(agent, lunch).expect(201)).body;
    const response = await put(agent, reading.id, lunch).expect(200);
    expect(response.body.reading).toEqual(reading);
  });

  it('updates value, slot and date', async () => {
    const { agent } = await createUserAndLogin();
    const { reading } = (await addReading(agent, lunch).expect(201)).body;
    const response = await put(agent, reading.id, {
      date: '2026-10-14',
      slot: 'after_dinner',
      value: 160,
    }).expect(200);
    expect(response.body.reading).toMatchObject({
      date: '2026-10-14',
      slot: 'after_dinner',
      value: 160,
    });
  });

  it('refuses to move a reading onto a slot that is taken', async () => {
    const { agent } = await createUserAndLogin();
    await addReading(agent, lunch).expect(201);
    const { reading } = (await addReading(agent, { ...lunch, slot: 'after_dinner' }).expect(201))
      .body;
    const response = await put(agent, reading.id, lunch).expect(409);
    expect(response.body.error.code).toBe('DUPLICATE_SLOT');
  });

  it('refuses to move a reading onto a full day', async () => {
    const { agent } = await createUserAndLogin();
    await fillDay(agent, DAY);
    const { reading } = (await addReading(agent, { ...lunch, date: '2026-10-14' }).expect(201))
      .body;
    const response = await put(agent, reading.id, lunch).expect(409);
    expect(response.body.error.message).toBe('You can add only 4 readings per day.');
  });

  it('allows editing a reading on a full day', async () => {
    const { agent } = await createUserAndLogin();
    const [first] = await fillDay(agent, DAY);
    await put(agent, first.id, { date: DAY, slot: first.slot, value: 131 }).expect(200);
  });

  it('validates fields on edit', async () => {
    const { agent } = await createUserAndLogin();
    const { reading } = (await addReading(agent, lunch).expect(201)).body;
    const response = await put(agent, reading.id, { ...lunch, value: 700 }).expect(400);
    expect(response.body.error.fields.value).toBe('Value must be between 40 and 600 mg/dl.');
  });
});

describe('DELETE /api/readings/:id', () => {
  it('deletes, then the reading is gone', async () => {
    const { agent } = await createUserAndLogin();
    const { reading } = (await addReading(agent, lunch).expect(201)).body;
    await agent.delete(`/api/readings/${reading.id}`).expect(204);
    await agent.get(`/api/readings/${reading.id}`).expect(404);
    await agent.delete(`/api/readings/${reading.id}`).expect(404);
  });

  it.each(['abc', '0', '-1', '1.5', '99999999999'])(
    'answers id %s with 404, not 500',
    async (id) => {
      const { agent } = await createUserAndLogin();
      await agent.get(`/api/readings/${id}`).expect(404);
    },
  );
});

describe('GET /api/readings filters', () => {
  it('filters by one date and keeps meal order', async () => {
    const { agent } = await createUserAndLogin();
    await addReading(agent, { date: DAY, slot: 'after_dinner', value: 150 }).expect(201);
    await addReading(agent, { date: DAY, slot: 'morning_fasting', value: 90 }).expect(201);
    await addReading(agent, { date: '2026-10-14', slot: 'after_lunch', value: 130 }).expect(201);

    const response = await agent.get(`/api/readings?date=${DAY}`).expect(200);
    expect(response.body.data.map((reading) => reading.slot)).toEqual([
      'morning_fasting',
      'after_dinner',
    ]);
    expect(response.body.pagination.total).toBe(2);
  });

  it('rejects a malformed date filter', async () => {
    const { agent } = await createUserAndLogin();
    const response = await agent.get('/api/readings?from=2026-02-30').expect(400);
    expect(response.body.error.fields).toEqual({ from: 'Please enter a valid date.' });
  });
});

describe('concurrency', () => {
  it('lets only one of two simultaneous adds for the same slot win', async () => {
    const { agent } = await createUserAndLogin();
    const statuses = (await Promise.all([addReading(agent, lunch), addReading(agent, lunch)]))
      .map((response) => response.status)
      .sort();
    expect(statuses).toEqual([201, 409]);
  });
});
