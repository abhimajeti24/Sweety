// Shared pino logger. Secrets are redacted so passwords, cookies and tokens never reach the logs.
import pino from 'pino';
import { config } from '../config.js';

const isDevelopment = config.nodeEnv === 'development';

export const logger = pino({
  level: config.logLevel,
  // Readable, coloured lines while developing; plain JSON everywhere else.
  transport: isDevelopment
    ? { target: 'pino-pretty', options: { translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' } }
    : undefined,
  redact: {
    paths: [
      'req.headers.cookie',
      'req.headers.authorization',
      'res.headers["set-cookie"]',
      'password',
      '*.password',
      'token',
    ],
    censor: '[redacted]',
  },
});
