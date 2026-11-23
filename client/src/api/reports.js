// Reports endpoints.
import { apiRequest } from './client.js';

/** Daily, month-to-date and monthly reports for a date ('YYYY-MM-DD'). */
export function fetchReports(date) {
  return apiRequest(`/reports?date=${encodeURIComponent(date)}`);
}

/** Every reading in a month ('YYYY-MM'), oldest first, for the chart. */
export function fetchMonthSeries(month) {
  return apiRequest(`/reports/series?month=${encodeURIComponent(month)}`);
}
