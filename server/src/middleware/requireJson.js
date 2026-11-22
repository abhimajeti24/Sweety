// Rejects write requests whose body is not JSON. A plain HTML form on another site can only send
// form or text bodies, so this closes one more CSRF route on top of the SameSite cookie.
import { AppError } from '../lib/AppError.js';

const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH']);

export function requireJson(req, _res, next) {
  const hasBody = Number(req.get('Content-Length') ?? 0) > 0 || req.get('Transfer-Encoding');
  if (METHODS_WITH_BODY.has(req.method) && hasBody && !req.is('application/json')) {
    return next(new AppError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Requests must be sent as JSON.'));
  }
  next();
}
