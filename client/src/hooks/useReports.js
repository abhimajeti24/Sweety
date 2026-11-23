// TanStack Query hooks for reports and the month chart.
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import * as reportsApi from '../api/reports.js';

export function useReports(date) {
  return useQuery({
    queryKey: ['reports', date],
    queryFn: () => reportsApi.fetchReports(date),
    placeholderData: keepPreviousData,
  });
}

export function useMonthSeries(month) {
  return useQuery({
    queryKey: ['series', month],
    queryFn: () => reportsApi.fetchMonthSeries(month),
    placeholderData: keepPreviousData,
  });
}
