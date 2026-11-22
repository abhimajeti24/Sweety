// Display helpers: dates like '15 Oct 2026', ranges like '1 Oct to 15 Oct 2026',
// slot labels with the right article, and one-decimal averages.
import { SLOTS } from './constants.js';
import { parseIsoDate } from './dates.js';

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** '2026-10-15' becomes '15 Oct 2026'. */
export function formatDisplayDate(isoDate) {
  const { year, month, day } = parseIsoDate(isoDate);
  return `${day} ${MONTHS_SHORT[month - 1]} ${year}`;
}

/** '2026-10-15' becomes '15 Oct' (no year). */
export function formatDayMonth(isoDate) {
  const { month, day } = parseIsoDate(isoDate);
  return `${day} ${MONTHS_SHORT[month - 1]}`;
}

/**
 * A readable range. The year is written once when both ends share it:
 * '1 Oct to 15 Oct 2026', otherwise '1 Dec 2026 to 31 Jan 2027'.
 * @param {string} from 'YYYY-MM-DD'
 * @param {string} to 'YYYY-MM-DD'
 * @param {string} [joiner] word between the two dates, 'to' by default ('and' reads better in sentences)
 */
export function formatRange(from, to, joiner = 'to') {
  const sameYear = from.slice(0, 4) === to.slice(0, 4);
  const start = sameYear ? formatDayMonth(from) : formatDisplayDate(from);
  return `${start} ${joiner} ${formatDisplayDate(to)}`;
}

/** '2026-10' becomes 'October 2026'. */
export function formatMonthLabel(isoMonth) {
  const [year, month] = isoMonth.split('-').map(Number);
  return `${MONTHS_LONG[month - 1]} ${year}`;
}

/** Human label for a slot key, for example 'after_lunch' becomes 'After lunch'. */
export function slotLabel(slotKey) {
  const slot = SLOTS.find((candidate) => candidate.key === slotKey);
  return slot ? slot.label : slotKey;
}

/**
 * Prefixes 'a' or 'an'. Every slot label starts with a letter whose sound matches its spelling,
 * so checking the first letter for a vowel is enough here.
 */
export function withArticle(label) {
  return /^[aeiou]/i.test(label) ? `an ${label}` : `a ${label}`;
}

/** 'You already have an After lunch reading for this date.' */
export function duplicateSlotMessage(slotKey) {
  return `You already have ${withArticle(slotLabel(slotKey))} reading for this date.`;
}

/** Average with exactly one decimal: 120 becomes '120.0'. Returns null when there is no average. */
export function formatAverage(average) {
  if (average === null || average === undefined) return null;
  return Number(average).toFixed(1);
}
