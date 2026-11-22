// Pure validation functions. The client runs them before submitting and the server runs them
// again as the source of truth. Each returns every field error at once so a form can show them together.
import {
  EMAIL_MAX_LENGTH,
  MESSAGES,
  NAME_MAX_LENGTH,
  PASSWORD_MAX_BYTES,
  PASSWORD_MIN_LENGTH,
  SLOT_KEYS,
  VALUE_MAX,
  VALUE_MIN,
} from './constants.js';
import { isFutureDate, isValidIsoDate } from './dates.js';

const WHOLE_NUMBER_STRING = /^\s*\d+\s*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isBlank(value) {
  return (
    value === undefined || value === null || (typeof value === 'string' && value.trim() === '')
  );
}

/**
 * Turns user input into a glucose value. Accepts a JS integer or a string of digits
 * (surrounding spaces and leading zeros allowed). Decimals, signs and exponents are rejected.
 * @param {unknown} raw
 * @returns {{ ok: true, value: number } | { ok: false, error: string }}
 */
export function parseGlucoseValue(raw) {
  if (isBlank(raw)) return { ok: false, error: MESSAGES.valueRequired };

  let value;
  if (typeof raw === 'number' && Number.isInteger(raw)) {
    value = raw;
  } else if (typeof raw === 'string' && WHOLE_NUMBER_STRING.test(raw)) {
    value = Number(raw.trim());
  } else {
    return { ok: false, error: MESSAGES.valueRange };
  }

  if (value < VALUE_MIN || value > VALUE_MAX) return { ok: false, error: MESSAGES.valueRange };
  return { ok: true, value };
}

/**
 * Validates the date of a reading against "today" in the user's timezone.
 * @param {unknown} date
 * @param {string} today 'YYYY-MM-DD'
 * @returns {string | null} the error message, or null when valid
 */
export function validateReadingDate(date, today) {
  if (isBlank(date)) return MESSAGES.dateRequired;
  if (!isValidIsoDate(date)) return MESSAGES.dateInvalid;
  if (isFutureDate(date, today)) return MESSAGES.futureDate;
  return null;
}

/**
 * Field validation for a reading (add and edit). Business rules that need the database
 * (duplicate slot, four per day) are checked separately by the server.
 * @param {{ date?: unknown, slot?: unknown, value?: unknown }} input
 * @param {{ today: string }} context today's date in the user's timezone
 * @returns {{ ok: boolean, fields: Record<string, string>, data: { date: string, slot: string, value: number } | null }}
 */
export function validateReadingInput(input, { today }) {
  if (!isValidIsoDate(today)) throw new TypeError('validateReadingInput needs today as YYYY-MM-DD');
  const { date, slot, value } = input ?? {};
  const fields = {};

  const dateError = validateReadingDate(date, today);
  if (dateError) fields.date = dateError;

  if (!SLOT_KEYS.includes(slot)) fields.slot = MESSAGES.slotRequired;

  const parsed = parseGlucoseValue(value);
  if (!parsed.ok) fields.value = parsed.error;

  const ok = Object.keys(fields).length === 0;
  return { ok, fields, data: ok ? { date, slot, value: parsed.value } : null };
}

function validateEmail(email) {
  const normalised = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const valid = normalised.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(normalised);
  return { normalised, error: valid ? null : MESSAGES.emailInvalid };
}

function passwordByteLength(password) {
  return new TextEncoder().encode(password).length;
}

/**
 * Validates the registration form. Name is trimmed, email is trimmed and lower-cased.
 * @param {{ name?: unknown, email?: unknown, password?: unknown }} input
 */
export function validateRegister(input) {
  const { name, email, password } = input ?? {};
  const fields = {};

  const trimmedName = typeof name === 'string' ? name.trim() : '';
  if (trimmedName === '') fields.name = MESSAGES.nameRequired;
  else if (trimmedName.length > NAME_MAX_LENGTH) fields.name = MESSAGES.nameTooLong;

  const checkedEmail = validateEmail(email);
  if (checkedEmail.error) fields.email = checkedEmail.error;

  if (
    typeof password !== 'string' ||
    password.length < PASSWORD_MIN_LENGTH ||
    passwordByteLength(password) > PASSWORD_MAX_BYTES
  ) {
    fields.password = MESSAGES.passwordLength;
  }

  const ok = Object.keys(fields).length === 0;
  return {
    ok,
    fields,
    data: ok ? { name: trimmedName, email: checkedEmail.normalised, password } : null,
  };
}

/**
 * Validates the login form. Only checks that both fields are filled in sensibly;
 * whether they match an account is the server's job.
 * @param {{ email?: unknown, password?: unknown }} input
 */
export function validateLogin(input) {
  const { email, password } = input ?? {};
  const fields = {};

  const checkedEmail = validateEmail(email);
  if (checkedEmail.error) fields.email = checkedEmail.error;
  if (typeof password !== 'string' || password === '') fields.password = MESSAGES.passwordRequired;

  const ok = Object.keys(fields).length === 0;
  return { ok, fields, data: ok ? { email: checkedEmail.normalised, password } : null };
}
