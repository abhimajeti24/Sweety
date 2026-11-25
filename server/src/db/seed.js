// Demo data: a patient with about two months of readings, a second patient, and a doctor
// assigned to the first patient.
// Idempotent: it deletes the demo accounts by email and recreates them, so it can run any time.
// Readings come from a seeded pseudo-random generator, so a given date always produces the same data.
import { pathToFileURL } from 'node:url';
import bcrypt from 'bcrypt';
import {
  DEMO_ACCOUNTS,
  DEMO_PASSWORD,
  SLOT_KEYS,
  addDays,
  getReportRanges,
  todayInTimeZone,
} from '@sweety/shared';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';
import { assignPatient } from '../repositories/doctorPatients.repo.js';
import { pool, withTransaction } from './pool.js';

// The accounts live in @sweety/shared so the login page can list the same credentials.

/** Mulberry32: a tiny deterministic random number generator returning floats in [0, 1). */
function createRandom(seed) {
  let state = seed >>> 0;
  return function random() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInt(random, min, max) {
  return min + Math.floor(random() * (max - min + 1));
}

/** A plausible value for a slot: mostly in a normal band, with an occasional high or low. */
function sampleValue(random, slot) {
  const roll = random();
  if (roll < 0.04) return randomInt(random, 200, 260);
  if (roll < 0.06 && slot === 'morning_fasting') return randomInt(random, 60, 69);
  return slot === 'morning_fasting' ? randomInt(random, 85, 130) : randomInt(random, 110, 190);
}

/** About one day in six misses one or two slots, like real life. */
function slotsForDay(random) {
  if (random() >= 1 / 6) return SLOT_KEYS;
  const missing = new Set();
  const missingCount = randomInt(random, 1, 2);
  while (missing.size < missingCount) missing.add(SLOT_KEYS[randomInt(random, 0, 3)]);
  return SLOT_KEYS.filter((slot) => !missing.has(slot));
}

/** Every date from `from` to `to` inclusive. */
function datesBetween(from, to) {
  const dates = [];
  for (let date = from; date <= to; date = addDays(date, 1)) dates.push(date);
  return dates;
}

/**
 * Demo Patient: every day of the previous month and of this month up to yesterday, then exactly
 * two readings today (fasting and after breakfast) so a demo can add the rest and hit both rules.
 */
export function buildDemoReadings(today, seed = 2026) {
  const random = createRandom(seed);
  const { monthly } = getReportRanges(today);
  const readings = [];
  for (const date of datesBetween(monthly.from, addDays(today, -1))) {
    for (const slot of slotsForDay(random)) {
      readings.push({ date, slot, value: sampleValue(random, slot) });
    }
  }
  readings.push({ date: today, slot: 'morning_fasting', value: 104 });
  readings.push({ date: today, slot: 'after_breakfast', value: 148 });
  return readings;
}

/** Ravi: a short, different week of readings, so logging in as him proves data is separate. */
function buildRaviReadings(today) {
  const random = createRandom(7);
  return datesBetween(addDays(today, -7), addDays(today, -1)).flatMap((date) =>
    ['morning_fasting', 'after_dinner'].map((slot) => ({
      date,
      slot,
      value: sampleValue(random, slot),
    })),
  );
}

async function insertReadings(client, userId, readings) {
  // One INSERT for the whole batch: unnest() turns the three arrays into rows.
  await client.query(
    `INSERT INTO readings (user_id, reading_date, slot, value_mg_dl)
     SELECT $1, date, slot::glucose_slot, value
     FROM unnest($2::date[], $3::text[], $4::int[]) AS batch(date, slot, value)`,
    [
      userId,
      readings.map((reading) => reading.date),
      readings.map((reading) => reading.slot),
      readings.map((reading) => reading.value),
    ],
  );
}

/**
 * Recreates the demo accounts and their readings.
 * @param {{ today?: string }} [options] today's date, injectable for tests
 * @returns {Promise<Record<string, number>>} user id per account key
 */
export async function seed({ today = todayInTimeZone(config.appTimeZone) } = {}) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, config.bcryptRounds);

  return withTransaction(async (client) => {
    await client.query('DELETE FROM users WHERE email = ANY($1)', [
      DEMO_ACCOUNTS.map((account) => account.email),
    ]);

    const ids = {};
    for (const account of DEMO_ACCOUNTS) {
      const { rows } = await client.query(
        `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id`,
        [account.name, account.email, passwordHash, account.role],
      );
      ids[account.key] = rows[0].id;
    }

    await insertReadings(client, ids.demo, buildDemoReadings(today));
    await insertReadings(client, ids.ravi, buildRaviReadings(today));
    // The doctor sees the demo patient only; Ravi has no doctor, which proves isolation.
    await assignPatient({ doctorId: ids.doctor, patientId: ids.demo }, client);
    return ids;
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await seed();
    logger.info(
      `Seeded demo accounts (password ${DEMO_PASSWORD}): ${DEMO_ACCOUNTS.map((a) => a.email).join(', ')}`,
    );
  } finally {
    await pool.end();
  }
}
