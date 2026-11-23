// Calendar helpers that work on 'YYYY-MM-DD' strings with UTC arithmetic, so the result never
// depends on the timezone of the machine running the code.

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_MONTH_PATTERN = /^(\d{4})-(\d{2})$/;

function pad2(n) {
  return String(n).padStart(2, '0');
}

/** Builds 'YYYY-MM-DD' from numeric parts (month is 1 to 12). */
export function toIsoDate(year, month, day) {
  return `${String(year).padStart(4, '0')}-${pad2(month)}-${pad2(day)}`;
}

/** Splits a valid 'YYYY-MM-DD' string into numbers. */
export function parseIsoDate(isoDate) {
  const [, year, month, day] = ISO_DATE_PATTERN.exec(isoDate);
  return { year: Number(year), month: Number(month), day: Number(day) };
}

/** Number of days in a month (month is 1 to 12). Day 0 of the next month is the last day of this one. */
export function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * True when the value is a real calendar date written as 'YYYY-MM-DD'.
 * '2026-02-30' is rejected because February has no 30th.
 * @param {unknown} value
 */
export function isValidIsoDate(value) {
  if (typeof value !== 'string') return false;
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  return day <= daysInMonth(year, month);
}

/** True when the value is a month written as 'YYYY-MM'. */
export function isValidIsoMonth(value) {
  if (typeof value !== 'string') return false;
  const match = ISO_MONTH_PATTERN.exec(value);
  if (!match) return false;
  const month = Number(match[2]);
  return Number(match[1]) >= 1 && month >= 1 && month <= 12;
}

/** True when the value is an IANA timezone name the runtime understands, such as 'Asia/Kolkata'. */
export function isValidTimeZone(value) {
  if (typeof value !== 'string' || value.trim() === '') return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/**
 * The calendar date 'now' falls on in the given timezone, as 'YYYY-MM-DD'.
 * `now` is a parameter so tests can pin the clock.
 * @param {string} timeZone IANA timezone name
 * @param {Date} [now]
 */
export function todayInTimeZone(timeZone, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** True when `isoDate` is after `today`. Both are 'YYYY-MM-DD', so string order is date order. */
export function isFutureDate(isoDate, today) {
  return isoDate > today;
}

/** Moves a 'YYYY-MM-DD' date by a whole number of days (negative goes back). */
export function addDays(isoDate, days) {
  const { year, month, day } = parseIsoDate(isoDate);
  const moved = new Date(Date.UTC(year, month - 1, day + days));
  return toIsoDate(moved.getUTCFullYear(), moved.getUTCMonth() + 1, moved.getUTCDate());
}

/** Number of calendar days from `from` to `to`, counting both ends ('2026-10-01' to '2026-10-15' is 15). */
export function countDaysInclusive(from, to) {
  const toUtc = (isoDate) => {
    const { year, month, day } = parseIsoDate(isoDate);
    return Date.UTC(year, month - 1, day);
  };
  const MS_PER_DAY = 86_400_000;
  return Math.round((toUtc(to) - toUtc(from)) / MS_PER_DAY) + 1;
}

/** First and last day of a 'YYYY-MM' month. */
export function getMonthRange(isoMonth) {
  const [year, month] = isoMonth.split('-').map(Number);
  return { from: toIsoDate(year, month, 1), to: toIsoDate(year, month, daysInMonth(year, month)) };
}

/** 'YYYY-MM' for the month a 'YYYY-MM-DD' date falls in. */
export function monthOf(isoDate) {
  return isoDate.slice(0, 7);
}

/**
 * The three report ranges for a selected date:
 * daily is the date itself, month-to-date runs from the 1st of that month to the date,
 * and monthly is the whole previous month.
 * @param {string} selectedDate 'YYYY-MM-DD'
 */
export function getReportRanges(selectedDate) {
  const { year, month } = parseIsoDate(selectedDate);
  const previousMonth = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;
  return {
    daily: { from: selectedDate, to: selectedDate },
    monthToDate: { from: toIsoDate(year, month, 1), to: selectedDate },
    monthly: {
      from: toIsoDate(previousYear, previousMonth, 1),
      to: toIsoDate(previousYear, previousMonth, daysInMonth(previousYear, previousMonth)),
    },
  };
}
