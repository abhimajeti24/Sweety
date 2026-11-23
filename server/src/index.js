// Starts the HTTP server and shuts it down cleanly on Ctrl+C or a container stop.
import { createApp } from './app.js';
import { config } from './config.js';
import { pool } from './db/pool.js';
import { cache } from './lib/cache.js';
import { logger } from './lib/logger.js';

const app = createApp();
const server = app.listen(config.port, () => {
  logger.info(`Sweety API listening on http://localhost:${config.port} (${config.nodeEnv})`);
});

async function shutdown(signal) {
  logger.info(`${signal} received, shutting down`);
  server.close();
  await Promise.all([pool.end(), cache.close()]);
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
