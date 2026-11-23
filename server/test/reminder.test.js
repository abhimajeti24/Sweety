import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { todayInTimeZone } from '@sweety/shared';
import { describe, expect, it } from 'vitest';
import { config } from '../src/config.js';
import { startReminderJobs } from '../src/jobs/queue.js';
import { REMINDER_QUEUE, createReminderWorker, runReminders } from '../src/jobs/reminder.worker.js';
import { addReading, assignPatient, createDoctorAndLogin, createUserAndLogin } from './helpers.js';

const DAY = '2026-10-15';

describe('runReminders', () => {
  it('lists patients with fewer than four readings and the slots they are missing', async () => {
    const partial = await createUserAndLogin();
    const complete = await createUserAndLogin();
    const none = await createUserAndLogin();
    const doctor = await createDoctorAndLogin();
    await assignPatient(doctor.user.id, partial.user.id);

    await addReading(partial.agent, { date: DAY, slot: 'morning_fasting', value: 100 });
    await addReading(partial.agent, { date: DAY, slot: 'after_breakfast', value: 140 });
    for (const slot of ['morning_fasting', 'after_breakfast', 'after_lunch', 'after_dinner']) {
      await addReading(complete.agent, { date: DAY, slot, value: 120 });
    }

    const reminders = await runReminders({ today: DAY });
    expect(reminders).toEqual([
      { userId: partial.user.id, logged: 2, missing: ['after_lunch', 'after_dinner'] },
      {
        userId: none.user.id,
        logged: 0,
        missing: ['morning_fasting', 'after_breakfast', 'after_lunch', 'after_dinner'],
      },
    ]);
  });
});

// These need a real Redis, because BullMQ runs Lua scripts on the server.
describe.skipIf(!config.redisUrl)('BullMQ reminder queue (real Redis via REDIS_URL_TEST)', () => {
  it('runs a queued reminder job through the worker', async () => {
    const { agent } = await createUserAndLogin();
    const today = todayInTimeZone(config.appTimeZone);
    await addReading(agent, { date: today, slot: 'morning_fasting', value: 100 });

    const connection = new Redis(config.redisUrl, { maxRetriesPerRequest: null });
    const queue = new Queue(REMINDER_QUEUE, { connection });
    const worker = createReminderWorker(connection);
    const finished = new Promise((resolve, reject) => {
      worker.on('completed', (_job, result) => resolve(result));
      worker.on('failed', (_job, error) => reject(error));
    });

    await queue.add('daily-reminder', {});
    expect(await finished).toEqual({ reminded: 1 });

    await worker.close();
    await queue.close();
    await connection.quit();
  });

  it('registers the daily schedule once, however often the server starts', async () => {
    const first = await startReminderJobs();
    const second = await startReminderJobs();

    const connection = new Redis(config.redisUrl, { maxRetriesPerRequest: null });
    const queue = new Queue(REMINDER_QUEUE, { connection });
    const schedulers = await queue.getJobSchedulers();
    expect(schedulers).toHaveLength(1);
    expect(schedulers[0]).toMatchObject({
      key: 'daily-reminder',
      pattern: config.reminderCron,
      tz: config.appTimeZone,
    });

    await Promise.all([first.close(), second.close(), queue.close()]);
    await connection.quit();
  });
});
