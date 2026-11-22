// Lets a request through only when it carries a valid session cookie, and sets req.user.
import { AppError } from '../lib/AppError.js';
import { SESSION_COOKIE, verifySessionToken } from '../lib/jwt.js';

export function requireAuth(req, _res, next) {
  const token = req.cookies?.[SESSION_COOKIE];
  const user = token ? verifySessionToken(token) : null;
  if (!user) return next(AppError.unauthenticated());
  req.user = user;
  next();
}
