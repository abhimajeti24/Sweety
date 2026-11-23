// Daily, month-to-date and monthly statistics for one user, plus the month series for the chart.
import {
  MESSAGES,
  getMonthRange,
  getReportRanges,
  isFutureDate,
  isValidIsoDate,
  isValidIsoMonth,
  monthOf,
} from '@sweety/shared';
import { AppError } from '../lib/AppError.js';
import { cache } from '../lib/cache.js';
import * as readingsRepo from '../repositories/readings.repo.js';

/** ?date defaults to today; it must be a real date and not in the future. */
function parseSelectedDate(rawDate, today) {
  if (rawDate === undefined || rawDate === '') return today;
  if (!isValidIsoDate(rawDate)) throw AppError.validation({ date: MESSAGES.dateInvalid });
  if (isFutureDate(rawDate, today)) throw AppError.validation({ date: MESSAGES.futureDate });
  return rawDate;
}

/**
 * Builds the three reports for a date. The daily report also lists that day's readings.
 * @param {number} userId
 * @param {string} selectedDate 'YYYY-MM-DD'
 */
export async function buildReports(userId, selectedDate) {
  const ranges = getReportRanges(selectedDate);
  const [dailyStats, monthToDateStats, monthlyStats, dailyReadings] = await Promise.all([
    readingsRepo.getStatsForRange({ userId, ...ranges.daily }),
    readingsRepo.getStatsForRange({ userId, ...ranges.monthToDate }),
    readingsRepo.getStatsForRange({ userId, ...ranges.monthly }),
    readingsRepo.listReadingsInRange({ userId, ...ranges.daily }),
  ]);

  return {
    selectedDate,
    daily: { range: ranges.daily, stats: dailyStats, readings: dailyReadings },
    monthToDate: { range: ranges.monthToDate, stats: monthToDateStats },
    monthly: { range: ranges.monthly, stats: monthlyStats },
  };
}

/**
 * GET /api/reports. Served from the Redis cache when it holds this user's current version.
 * @param {number} userId
 * @param {Record<string, unknown>} query
 * @param {string} today 'YYYY-MM-DD' in the user's timezone
 */
export async function getReports(userId, query, today) {
  const selectedDate = parseSelectedDate(query.date, today);
  const key = await cache.reportKey(userId, selectedDate);
  const cached = await cache.get(key);
  if (cached) return cached;

  const reports = await buildReports(userId, selectedDate);
  await cache.set(key, reports);
  return reports;
}

/**
 * Every reading in a month, oldest first, for the line chart. ?month defaults to this month.
 * @returns {Promise<import('../repositories/readings.repo.js').Reading[]>}
 */
export async function getMonthSeries(userId, query, today) {
  const month = query.month || monthOf(today);
  if (!isValidIsoMonth(month)) throw AppError.validation({ month: MESSAGES.monthInvalid });
  return readingsRepo.listReadingsInRange({ userId, ...getMonthRange(month) });
}
