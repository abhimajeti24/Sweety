// TanStack Query hooks for readings. Every change refreshes readings, reports and the chart,
// because one new reading can change all three.
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MAX_READINGS_PER_DAY, todayInTimeZone } from '@sweety/shared';
import { browserTimeZone } from '../api/client.js';
import * as readingsApi from '../api/readings.js';

export const PAGE_SIZE = 20;

/** Today's date in the browser's timezone, the same rule the server applies. */
export function useToday() {
  return todayInTimeZone(browserTimeZone());
}

/** The readings for one date (at most four), in slot order. */
export function useDayReadings(date, { enabled = true } = {}) {
  return useQuery({
    queryKey: ['readings', 'day', date],
    queryFn: async () => {
      const { data } = await readingsApi.listReadings({ date, limit: MAX_READINGS_PER_DAY });
      return data;
    },
    enabled: enabled && Boolean(date),
  });
}

/** One page of the history list. The previous page stays on screen while the next one loads. */
export function useReadingsPage({ page, from, to }) {
  return useQuery({
    queryKey: ['readings', 'list', { page, from, to }],
    queryFn: () => readingsApi.listReadings({ page, limit: PAGE_SIZE, from, to }),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateReadingData() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['readings'] }),
      queryClient.invalidateQueries({ queryKey: ['reports'] }),
      queryClient.invalidateQueries({ queryKey: ['series'] }),
    ]);
}

export function useCreateReading() {
  const invalidate = useInvalidateReadingData();
  return useMutation({ mutationFn: readingsApi.createReading, onSuccess: invalidate });
}

export function useUpdateReading() {
  const invalidate = useInvalidateReadingData();
  return useMutation({
    mutationFn: ({ id, reading }) => readingsApi.updateReading(id, reading),
    onSuccess: invalidate,
  });
}

export function useDeleteReading() {
  const invalidate = useInvalidateReadingData();
  return useMutation({ mutationFn: readingsApi.deleteReading, onSuccess: invalidate });
}
