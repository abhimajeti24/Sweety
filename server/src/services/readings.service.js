// Business rules for readings: field validation, the four-per-day limit and one reading per slot.
// Checks run inside a transaction with a per-user lock, and the database constraints back them up.
import {
  ERROR_CODES,
  MAX_READINGS_PER_DAY,
  MESSAGES,
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_MAX,
  duplicateSlotMessage,
  isValidIsoDate,
  validateReadingInput,
} from '@sweety/shared';
import { withTransaction } from '../db/pool.js';
import { AppError } from '../lib/AppError.js';
import { cache } from '../lib/cache.js';
import { parseOptionalInteger } from '../lib/params.js';
import * as readingsRepo from '../repositories/readings.repo.js';

function validateOrThrow(input, today) {
  const { ok, fields, data } = validateReadingInput(input, { today });
  if (!ok) throw AppError.validation(fields);
  return data;
}

/**
 * The two rules that need the database, in a fixed order: the daily limit first, then the slot.
 * Because there are exactly four slots, a full day always has every slot taken, so checking the
 * limit first is what makes "You can add only 4 readings per day." reachable at all.
 * `excludeId` leaves out the reading being edited, so saving it unchanged is allowed.
 */
async function assertDayRules({ userId, date, slot, excludeId = null }, db) {
  const count = await readingsRepo.countReadingsForDay({ userId, date, excludeId }, db);
  if (count >= MAX_READINGS_PER_DAY) {
    throw AppError.conflict(ERROR_CODES.dailyLimit, MESSAGES.dailyLimit, 'date');
  }
  if (await readingsRepo.isSlotTaken({ userId, date, slot, excludeId }, db)) {
    throw AppError.conflict(ERROR_CODES.duplicateSlot, duplicateSlotMessage(slot), 'slot');
  }
}

function readingNotFound() {
  return AppError.notFound(MESSAGES.readingNotFound);
}

/**
 * @param {number} userId
 * @param {unknown} input request body { date, slot, value }
 * @param {string} today 'YYYY-MM-DD' in the user's timezone
 */
export async function createReading(userId, input, today) {
  const data = validateOrThrow(input, today);
  const reading = await withTransaction(async (client) => {
    await readingsRepo.lockUserReadings(userId, client);
    await assertDayRules({ userId, date: data.date, slot: data.slot }, client);
    return readingsRepo.insertReading({ userId, ...data }, client);
  });
  // After the commit, so a report cached in between cannot hold the old numbers.
  await cache.bumpUserVersion(userId);
  return reading;
}

/** Full replace of one of the user's readings. */
export async function updateReading(userId, id, input, today) {
  const reading = await withTransaction(async (client) => {
    await readingsRepo.lockUserReadings(userId, client);
    const existing = await readingsRepo.findReadingById({ userId, id }, client);
    if (!existing) throw readingNotFound();

    const data = validateOrThrow(input, today);
    await assertDayRules({ userId, date: data.date, slot: data.slot, excludeId: id }, client);
    return readingsRepo.updateReading({ id, userId, ...data }, client);
  });
  await cache.bumpUserVersion(userId);
  return reading;
}

export async function deleteReading(userId, id) {
  const deleted = await readingsRepo.deleteReading({ id, userId });
  if (!deleted) throw readingNotFound();
  await cache.bumpUserVersion(userId);
}

export async function getReading(userId, id) {
  const reading = await readingsRepo.findReadingById({ userId, id });
  if (!reading) throw readingNotFound();
  return reading;
}

/** Checks ?date, ?from, ?to, ?page and ?limit, collecting every problem. */
function parseListQuery(query) {
  const fields = {};
  for (const name of ['date', 'from', 'to']) {
    const value = query[name];
    if (value !== undefined && value !== '' && !isValidIsoDate(value)) {
      fields[name] = MESSAGES.dateInvalid;
    }
  }

  const page = parseOptionalInteger(query.page, 1);
  if (!Number.isInteger(page) || page < 1) fields.page = MESSAGES.pageInvalid;

  const limit = parseOptionalInteger(query.limit, PAGE_SIZE_DEFAULT);
  if (!Number.isInteger(limit) || limit < 1 || limit > PAGE_SIZE_MAX) {
    fields.limit = MESSAGES.limitInvalid;
  }

  if (Object.keys(fields).length > 0) throw AppError.validation(fields);

  // ?date is a shortcut for a one-day range.
  const from = query.date || query.from || null;
  const to = query.date || query.to || null;
  return { from, to, page, limit };
}

/**
 * A page of the user's readings plus pagination details.
 * @param {number} userId
 * @param {Record<string, unknown>} query
 */
export async function listReadings(userId, query) {
  const { from, to, page, limit } = parseListQuery(query);
  const [data, total] = await Promise.all([
    readingsRepo.listReadings({ userId, from, to, limit, offset: (page - 1) * limit }),
    readingsRepo.countReadings({ userId, from, to }),
  ]);
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
