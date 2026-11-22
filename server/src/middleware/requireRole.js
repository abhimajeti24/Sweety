// Keeps patient routes and doctor routes apart. Must run after requireAuth.
import { AppError } from '../lib/AppError.js';

/** @param {'patient' | 'doctor'} role */
export function requireRole(role) {
  return function checkRole(req, _res, next) {
    if (req.user?.role !== role) return next(AppError.forbidden());
    next();
  };
}
