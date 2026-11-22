// Builds the Express app: security middleware, routes and error handling.
// It does not call listen(), so tests can drive it directly with Supertest.
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { config } from './config.js';
import { logger } from './lib/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { requireAuth } from './middleware/requireAuth.js';
import { requireJson } from './middleware/requireJson.js';
import { requireRole } from './middleware/requireRole.js';
import { timeZone } from './middleware/timeZone.js';
import { authRoutes } from './routes/auth.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { readingsRoutes } from './routes/readings.routes.js';
import { reportsRoutes } from './routes/reports.routes.js';

const CLIENT_DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');

/** Serves the built React app and sends index.html for client-side routes like /reports. */
function serveClient(app) {
  app.use(express.static(CLIENT_DIST));
  app.get('/{*path}', (_req, res) => res.sendFile(path.join(CLIENT_DIST, 'index.html')));
}

export function createApp() {
  const app = express();

  // HTTPS-only headers are switched on together with secure cookies, so the app still
  // works over plain http://localhost (for example in Docker).
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: { upgradeInsecureRequests: config.cookieSecure ? [] : null },
      },
      strictTransportSecurity: config.cookieSecure,
    }),
  );
  app.use(
    pinoHttp({
      logger,
      genReqId: (req, res) => {
        const id = req.headers['x-request-id'] ?? randomUUID();
        res.setHeader('X-Request-Id', id);
        return id;
      },
      autoLogging: !config.isTest,
      customLogLevel: (_req, res, error) => {
        if (error || res.statusCode >= 500) return 'error';
        return res.statusCode >= 400 ? 'warn' : 'info';
      },
      customSuccessMessage: (req, res) => `${req.method} ${req.originalUrl} ${res.statusCode}`,
      serializers: {
        req: (req) => ({ id: req.id, method: req.method, url: req.url }),
        res: (res) => ({ statusCode: res.statusCode }),
      },
    }),
  );
  app.use(cors({ origin: config.clientOrigin, credentials: true }));
  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());

  app.use('/api', requireJson, timeZone);
  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/readings', requireAuth, requireRole('patient'), readingsRoutes);
  app.use('/api/reports', requireAuth, requireRole('patient'), reportsRoutes);
  app.use('/api', notFound);

  if (config.isProduction && existsSync(CLIENT_DIST)) serveClient(app);

  app.use(errorHandler);
  return app;
}
