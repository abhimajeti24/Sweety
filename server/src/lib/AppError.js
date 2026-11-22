// The one error type services throw. The error handler turns it into the JSON error shape:
// { error: { code, message, fields? } }.
import { ERROR_CODES, MESSAGES } from '@sweety/shared';

export class AppError extends Error {
  /**
   * @param {number} status HTTP status code
   * @param {string} code stable machine-readable code, for example 'DUPLICATE_SLOT'
   * @param {string} message text safe to show to the user
   * @param {Record<string, string>} [fields] per-field messages for forms
   */
  constructor(status, code, message, fields) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }

  /** 400 with per-field messages. A single problem becomes the headline message too. */
  static validation(fields) {
    const messages = Object.values(fields);
    const message = messages.length === 1 ? messages[0] : MESSAGES.fixFields;
    return new AppError(400, ERROR_CODES.validation, message, fields);
  }

  /** 409 for a broken business rule, pointing at the field the user should change. */
  static conflict(code, message, field) {
    return new AppError(409, code, message, { [field]: message });
  }

  static unauthenticated(message = MESSAGES.loginRequired) {
    return new AppError(401, ERROR_CODES.unauthenticated, message);
  }

  static forbidden() {
    return new AppError(403, ERROR_CODES.forbidden, MESSAGES.forbidden);
  }

  static notFound(message = MESSAGES.notFound) {
    return new AppError(404, ERROR_CODES.notFound, message);
  }
}
