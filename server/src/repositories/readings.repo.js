// SQL for the readings table. Every query is scoped by user_id, so one user can never read or
// change another user's rows. Column names are mapped to the API shape here and nowhere else.
import { slotLabel } from '@sweety/shared';
import { pool } from '../db/pool.js';

const READING_COLUMNS = 'id, reading_date, slot, value_mg_dl';

/** @typedef {{ id: number, date: string, slot: string, slotLabel: string, value: number }} Reading */

/** @returns {Reading} */
function toReading(row) {
  return {
    id: row.id,
    date: row.reading_date,
    slot: row.slot,
    slotLabel: slotLabel(row.slot),
    value: row.value_mg_dl,
  };
}

/**
 * Serialises writes for one user until the surrounding transaction ends, so two requests
 * cannot both pass the "4 per day" count check at the same moment. Must run inside a transaction.
 */
export async function lockUserReadings(userId, db) {
  await db.query("SELECT pg_advisory_xact_lock(hashtext('readings'), $1)", [userId]);
}

/** How many readings the user has on a date, optionally ignoring one (the reading being edited). */
export async function countReadingsForDay({ userId, date, excludeId = null }, db = pool) {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS count FROM readings
     WHERE user_id = $1 AND reading_date = $2 AND ($3::int IS NULL OR id <> $3)`,
    [userId, date, excludeId],
  );
  return rows[0].count;
}

/** True when the user already has a reading in this slot on this date (ignoring `excludeId`). */
export async function isSlotTaken({ userId, date, slot, excludeId = null }, db = pool) {
  const { rows } = await db.query(
    `SELECT 1 FROM readings
     WHERE user_id = $1 AND reading_date = $2 AND slot = $3 AND ($4::int IS NULL OR id <> $4)`,
    [userId, date, slot, excludeId],
  );
  return rows.length > 0;
}

/** @returns {Promise<Reading | null>} */
export async function findReadingById({ userId, id }, db = pool) {
  const { rows } = await db.query(
    `SELECT ${READING_COLUMNS} FROM readings WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  return rows[0] ? toReading(rows[0]) : null;
}

/**
 * One page of readings, newest date first, slots in meal order within a day.
 * `from` and `to` are optional inclusive date bounds.
 * @returns {Promise<Reading[]>}
 */
export async function listReadings({ userId, from = null, to = null, limit, offset }, db = pool) {
  const { rows } = await db.query(
    `SELECT ${READING_COLUMNS} FROM readings
     WHERE user_id = $1
       AND ($2::date IS NULL OR reading_date >= $2)
       AND ($3::date IS NULL OR reading_date <= $3)
     ORDER BY reading_date DESC, slot ASC
     LIMIT $4 OFFSET $5`,
    [userId, from, to, limit, offset],
  );
  return rows.map(toReading);
}

/** Total readings matching the same filters as listReadings, for pagination. */
export async function countReadings({ userId, from = null, to = null }, db = pool) {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS total FROM readings
     WHERE user_id = $1
       AND ($2::date IS NULL OR reading_date >= $2)
       AND ($3::date IS NULL OR reading_date <= $3)`,
    [userId, from, to],
  );
  return rows[0].total;
}

/** Every reading in an inclusive date range, oldest first (for the daily list and the chart). */
export async function listReadingsInRange({ userId, from, to }, db = pool) {
  const { rows } = await db.query(
    `SELECT ${READING_COLUMNS} FROM readings
     WHERE user_id = $1 AND reading_date BETWEEN $2 AND $3
     ORDER BY reading_date ASC, slot ASC`,
    [userId, from, to],
  );
  return rows.map(toReading);
}

/**
 * Highest, lowest, average and count for an inclusive date range. The average is rounded to one
 * decimal in SQL (numeric ROUND rounds half away from zero), so JS never has to round floats.
 * An empty range gives count 0 and nulls.
 * @returns {Promise<{ count: number, highest: number | null, lowest: number | null, average: number | null }>}
 */
export async function getStatsForRange({ userId, from, to }, db = pool) {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int                               AS count,
            MAX(value_mg_dl)::int                       AS highest,
            MIN(value_mg_dl)::int                       AS lowest,
            ROUND(AVG(value_mg_dl)::numeric, 1)::float8 AS average
     FROM readings
     WHERE user_id = $1 AND reading_date BETWEEN $2 AND $3`,
    [userId, from, to],
  );
  return rows[0];
}

/**
 * Patients with fewer than four readings on a date, with the slots they did log.
 * The LEFT JOIN keeps patients with no readings at all (they count as 0).
 * @returns {Promise<Array<{ userId: number, logged: number, slots: string[] }>>}
 */
export async function listPatientsBelowDailyLimit({ date, limit }, db = pool) {
  const { rows } = await db.query(
    `SELECT u.id AS user_id,
            COUNT(r.id)::int AS logged,
            COALESCE(array_agg(r.slot::text) FILTER (WHERE r.id IS NOT NULL), '{}') AS slots
     FROM users u
     LEFT JOIN readings r ON r.user_id = u.id AND r.reading_date = $1
     WHERE u.role = 'patient'
     GROUP BY u.id
     HAVING COUNT(r.id) < $2
     ORDER BY u.id`,
    [date, limit],
  );
  return rows.map((row) => ({ userId: row.user_id, logged: row.logged, slots: row.slots }));
}

/** @returns {Promise<Reading>} */
export async function insertReading({ userId, date, slot, value }, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO readings (user_id, reading_date, slot, value_mg_dl)
     VALUES ($1, $2, $3, $4)
     RETURNING ${READING_COLUMNS}`,
    [userId, date, slot, value],
  );
  return toReading(rows[0]);
}

/** @returns {Promise<Reading | null>} null when the reading does not exist or is not the user's */
export async function updateReading({ id, userId, date, slot, value }, db = pool) {
  const { rows } = await db.query(
    `UPDATE readings
     SET reading_date = $3, slot = $4, value_mg_dl = $5, updated_at = now()
     WHERE id = $1 AND user_id = $2
     RETURNING ${READING_COLUMNS}`,
    [id, userId, date, slot, value],
  );
  return rows[0] ? toReading(rows[0]) : null;
}

/** @returns {Promise<boolean>} true when a row was deleted */
export async function deleteReading({ id, userId }, db = pool) {
  const { rowCount } = await db.query('DELETE FROM readings WHERE id = $1 AND user_id = $2', [
    id,
    userId,
  ]);
  return rowCount > 0;
}
