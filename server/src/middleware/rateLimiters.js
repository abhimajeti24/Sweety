// Slows down password guessing and sign-up spam: 10 attempts per 15 minutes per IP address.
import rateLimit from 'express-rate-limit';
import { ERROR_CODES, MESSAGES } from '@sweety/shared';
import { config } from '../config.js';
import { AppError } from '../lib/AppError.js';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function createLimiter(options) {
  return rateLimit({
    windowMs: WINDOW_MS,
    limit: MAX_ATTEMPTS,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: () => config.isTest,
    handler: (_req, _res, next) =>
      next(new AppError(429, ERROR_CODES.rateLimited, MESSAGES.tooManyRequests)),
    ...options,
  });
}

// Only failed logins count, so someone who logs in and out during a demo is never locked out.
export const loginLimiter = createLimiter({ skipSuccessfulRequests: true });
export const registerLimiter = createLimiter();
