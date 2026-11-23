// Starts the HTTP server (and, when Redis is configured, the daily reminder job) and shuts both
// down cleanly on Ctrl+C or a container stop.
import { createApp } from './app.js';
import { config } from './config.js';
import { pool } from './db/pool.js';
import { startReminderJobs } from './jobs/queue.js';
import { cache } from './lib/cache.js';
import { logger } from './lib/logger.js';

const app = createApp();
const server = app.listen(config.port, () => {
  logger.info(`Sweety API listening on http://localhost:${config.port} (${config.nodeEnv})`);
});

// Started in the background: reminders are a bonus, and the API must not wait on Redis.
let reminderJobs = null;
if (config.redisUrl) {
  startReminderJobs()
    .then((jobs) => {
      reminderJobs = jobs;
    })
    .catch((error) => {
      logger.warn({ err: error }, 'Could not start the reminder job; continuing without it');
    });
}

async function shutdown(signal) {
  logger.info(`${signal} received, shutting down`);
  server.close();
  await reminderJobs?.close();
  await Promise.all([pool.end(), cache.close()]);
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
