import { describe, expect, it } from 'vitest';
import {
  addDays,
  getMonthRange,
  getReportRanges,
  isFutureDate,
  isValidIsoDate,
  isValidIsoMonth,
  isValidTimeZone,
  todayInTimeZone,
} from '../src/dates.js';

describe('getReportRanges', () => {
  // Every row of the table in Section 8 of the build plan.
  it.each([
    ['2026-10-15', '2026-10-01', '2026-09-01', '2026-09-30'], // the brief's example
    ['2026-11-01', '2026-11-01', '2026-10-01', '2026-10-31'],
    ['2027-01-01', '2027-01-01', '2026-12-01', '2026-12-31'], // January looks back into last year
    ['2026-03-15', '2026-03-01', '2026-02-01', '2026-02-28'],
    ['2028-03-31', '2028-03-01', '2028-02-01', '2028-02-29'], // leap year
  ])('for %s', (selected, mtdFrom, monthlyFrom, monthlyTo) => {
    expect(getReportRanges(selected)).toEqual({
      daily: { from: selected, to: selected },
      monthToDate: { from: mtdFrom, to: selected },
      monthly: { from: monthlyFrom, to: monthlyTo },
    });
  });
});

describe('todayInTimeZone', () => {
  const now = new Date('2026-10-15T20:00:00Z');

  it('is already the 16th in Kolkata (UTC+5:30)', () => {
    expect(todayInTimeZone('Asia/Kolkata', now)).toBe('2026-10-16');
  });

  it('is still the 15th in New York', () => {
    expect(todayInTimeZone('America/New_York', now)).toBe('2026-10-15');
  });
});

describe('isValidIsoDate', () => {
  it.each(['2026-10-15', '2028-02-29', '1990-01-01'])('accepts %s', (date) => {
    expect(isValidIsoDate(date)).toBe(true);
  });

  it.each([
    '2026-02-30',
    '2027-02-29',
    '2026-00-10',
    '2026-10-32',
    '2026-10-15T00:00',
    '',
    null,
    20261015,
  ])('rejects %j', (date) => {
    expect(isValidIsoDate(date)).toBe(false);
  });
});

describe('other date helpers', () => {
  it('compares dates as calendar days', () => {
    expect(isFutureDate('2026-10-16', '2026-10-15')).toBe(true);
    expect(isFutureDate('2026-10-15', '2026-10-15')).toBe(false);
  });

  it('moves across month and year ends', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('gives the bounds of a month', () => {
    expect(getMonthRange('2028-02')).toEqual({ from: '2028-02-01', to: '2028-02-29' });
  });

  it('checks months and timezones', () => {
    expect(isValidIsoMonth('2026-10')).toBe(true);
    expect(isValidIsoMonth('2026-13')).toBe(false);
    expect(isValidTimeZone('Asia/Kolkata')).toBe(true);
    expect(isValidTimeZone('Mars/Olympus')).toBe(false);
    expect(isValidTimeZone(undefined)).toBe(false);
  });
});
