// The daily reminder (bonus B7): find patients with fewer than four readings today and log one line
// each, for example "reminder user=12 date=2026-11-23 logged=2/4 missing=after_lunch,after_dinner".
// Nothing is sent anywhere; a real product would email or push here.
// Run one pass by hand with `npm run job:reminders` (no Redis needed).
import { pathToFileURL } from 'node:url';
import { Worker } from 'bullmq';
import { MAX_READINGS_PER_DAY, SLOT_KEYS, todayInTimeZone } from '@sweety/shared';
import { config } from '../config.js';
import { pool } from '../db/pool.js';
import { logger } from '../lib/logger.js';
import * as readingsRepo from '../repositories/readings.repo.js';

export const REMINDER_QUEUE = 'reminders';

/**
 * One reminder pass. "Today" is the app's timezone, because the job runs on the server.
 * @param {{ today?: string }} [options] injectable for tests
 * @returns {Promise<Array<{ userId: number, logged: number, missing: string[] }>>}
 */
export async function runReminders({ today = todayInTimeZone(config.appTimeZone) } = {}) {
  const patients = await readingsRepo.listPatientsBelowDailyLimit({
    date: today,
    limit: MAX_READINGS_PER_DAY,
  });

  return patients.map(({ userId, logged, slots }) => {
    const missing = SLOT_KEYS.filter((slot) => !slots.includes(slot));
    logger.info(
      `reminder user=${userId} date=${today} logged=${logged}/${MAX_READINGS_PER_DAY} missing=${missing.join(',')}`,
    );
    return { userId, logged, missing };
  });
}

/** The BullMQ worker that runs a pass whenever the scheduler drops a job on the queue. */
export function createReminderWorker(connection) {
  const worker = new Worker(
    REMINDER_QUEUE,
    async () => {
      const reminded = await runReminders();
      return { reminded: reminded.length };
    },
    { connection },
  );
  worker.on('completed', (job, result) =>
    logger.info({ jobId: job.id, ...result }, 'Reminder job finished'),
  );
  worker.on('failed', (job, error) =>
    logger.error({ jobId: job?.id, err: error }, 'Reminder job failed'),
  );
  return worker;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const reminded = await runReminders();
    logger.info(
      `Reminder pass done: ${reminded.length} patient(s) below ${MAX_READINGS_PER_DAY} today`,
    );
  } finally {
    await pool.end();
  }
}
