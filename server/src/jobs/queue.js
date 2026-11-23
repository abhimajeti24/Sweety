// Registers the daily reminder on a BullMQ queue (cron REMINDER_CRON in APP_TIMEZONE, 8 pm IST by
// default) and starts the worker that runs it. Only called when REDIS_URL is set.
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';
import { REMINDER_QUEUE, createReminderWorker } from './reminder.worker.js';

const SCHEDULER_ID = 'daily-reminder';

/** @returns {Promise<{ close: () => Promise<void> }>} call close() on shutdown */
export async function startReminderJobs() {
  // BullMQ blocks on Redis while waiting for jobs, so it needs retries switched off per request.
  const connection = new Redis(config.redisUrl, { maxRetriesPerRequest: null });

  // While Redis is down every client emits an error on each reconnect attempt. Log the first one
  // and stay quiet until the connection is back.
  let warned = false;
  const warnOnce = (error) => {
    if (!warned) logger.warn({ err: error }, 'Reminder queue cannot reach Redis yet; retrying');
    warned = true;
  };
  connection.on('error', warnOnce);
  connection.on('ready', () => {
    warned = false;
  });

  const queue = new Queue(REMINDER_QUEUE, { connection });
  queue.on('error', warnOnce);

  // Upsert, so restarting the server never registers the schedule twice.
  await queue.upsertJobScheduler(
    SCHEDULER_ID,
    { pattern: config.reminderCron, tz: config.appTimeZone },
    { name: SCHEDULER_ID },
  );
  const worker = createReminderWorker(connection);
  worker.on('error', warnOnce);
  logger.info(`Reminder job scheduled: "${config.reminderCron}" in ${config.appTimeZone}`);

  return {
    async close() {
      await worker.close();
      await queue.close();
      await connection.quit();
    },
  };
}
