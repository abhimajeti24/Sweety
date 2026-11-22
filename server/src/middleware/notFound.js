// Answers unknown /api routes with the standard JSON error instead of an HTML page.
import { AppError } from '../lib/AppError.js';

export function notFound(_req, _res, next) {
  next(AppError.notFound());
}
