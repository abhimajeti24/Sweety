// Turns every error into the JSON shape { error: { code, message, fields? } }.
// Known problems keep their status; anything unexpected becomes a 500 with no internal details.
import { ERROR_CODES, MESSAGES, duplicateSlotMessage } from '@sweety/shared';
import { AppError } from '../lib/AppError.js';

const PG_UNIQUE_VIOLATION = '23505';
const PG_CHECK_VIOLATION = '23514';
const PG_INVALID_TEXT = '22P02';

// pg reports the clashing key as: Key (user_id, reading_date, slot)=(1, 2026-10-15, after_lunch) already exists.
const SLOT_IN_DETAIL = /=\(\d+, [\d-]+, (\w+)\)/;

/** Maps database and body-parser errors to AppErrors. Returns null for unknown errors. */
function toAppError(error) {
  if (error instanceof AppError) return error;

  if (error.code === PG_UNIQUE_VIOLATION && error.constraint === 'readings_one_per_slot') {
    // Two requests raced past the service check; the database constraint caught the second one.
    const slot = SLOT_IN_DETAIL.exec(error.detail ?? '')?.[1];
    return AppError.conflict(ERROR_CODES.duplicateSlot, duplicateSlotMessage(slot), 'slot');
  }
  if (error.code === PG_UNIQUE_VIOLATION && error.constraint === 'users_email_lower_key') {
    return AppError.conflict(ERROR_CODES.emailTaken, MESSAGES.emailTaken, 'email');
  }
  if (error.code === PG_CHECK_VIOLATION) {
    return AppError.validation({ value: MESSAGES.valueRange });
  }
  if (error.code === PG_INVALID_TEXT) {
    return new AppError(400, ERROR_CODES.validation, MESSAGES.invalidBody);
  }
  if (error.type === 'entity.parse.failed') {
    return new AppError(400, ERROR_CODES.validation, MESSAGES.invalidBody);
  }
  if (error.type === 'entity.too.large') {
    return new AppError(413, ERROR_CODES.payloadTooLarge, MESSAGES.payloadTooLarge);
  }
  return null;
}

// Express recognises an error handler by its four parameters, so `_next` must stay in the signature.
export function errorHandler(error, req, res, _next) {
  let appError = toAppError(error);
  if (!appError) {
    req.log?.error({ err: error }, 'Unhandled error');
    appError = new AppError(500, ERROR_CODES.internal, MESSAGES.serverError);
  }

  const body = { code: appError.code, message: appError.message };
  if (appError.fields) body.fields = appError.fields;
  res.status(appError.status).json({ error: body });
}
