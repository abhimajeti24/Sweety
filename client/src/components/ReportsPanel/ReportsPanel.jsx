// The three report cards for a date plus the chart for that date's month. Used by the patient's
// Reports page and, read-only, by the doctor's patient page.
import { PlusIcon } from '@phosphor-icons/react';
import { formatDisplayDate, formatRange, monthOf, slotLabel } from '@sweety/shared';
import { firstEmptySlot } from '../../lib/readingRules.js';
import { Button } from '../Button/Button.jsx';
import { ErrorState } from '../ErrorState/ErrorState.jsx';
import { MonthChart } from '../MonthChart/MonthChart.jsx';
import { ReportCard } from '../ReportCard/ReportCard.jsx';
import styles from './ReportsPanel.module.css';

function emptyRangeMessage({ from, to }) {
  return `No readings between ${formatRange(from, to, 'and')}.`;
}

/**
 * @param {object} props
 * @param {string} props.date the selected date 'YYYY-MM-DD'
 * @param {import('@tanstack/react-query').UseQueryResult} props.reports
 * @param {import('@tanstack/react-query').UseQueryResult} props.series
 * @param {(slot: string) => void} [props.onAddReading] omitted for read-only (doctor) views
 */
export function ReportsPanel({ date, reports, series, onAddReading }) {
  if (reports.isError)
    return <ErrorState message={reports.error.message} onRetry={reports.refetch} />;

  // Only show numbers that belong to the selected date: while another date loads, the previous
  // date's numbers under this date's label would mislead, so the cards show skeletons instead.
  const data = reports.data;
  const ranges = data?.selectedDate === date ? data : null;
  const daily = ranges?.daily;
  const nextSlot = daily
    ? (firstEmptySlot(daily.readings) ?? 'morning_fasting')
    : 'morning_fasting';

  return (
    <div className={styles.panel}>
      <div className={styles.cards} aria-busy={reports.isFetching || undefined}>
        <ReportCard
          title="Daily"
          rangeLabel={formatDisplayDate(date)}
          stats={daily?.stats}
          readings={daily?.readings}
          emptyMessage={
            onAddReading
              ? `Nothing logged on ${formatDisplayDate(date)} yet. Add your ${slotLabel(nextSlot)} reading to start the day.`
              : `Nothing logged on ${formatDisplayDate(date)}.`
          }
          emptyAction={
            onAddReading && (
              <Button
                variant="secondary"
                size="sm"
                icon={PlusIcon}
                onClick={() => onAddReading(nextSlot)}
              >
                Add reading
              </Button>
            )
          }
        />
        <ReportCard
          title="Month-to-date"
          rangeLabel={ranges ? formatRange(ranges.monthToDate.range.from, date) : ''}
          stats={ranges?.monthToDate.stats}
          emptyMessage={ranges ? emptyRangeMessage(ranges.monthToDate.range) : ''}
        />
        <ReportCard
          title="Monthly"
          rangeLabel={ranges ? formatRange(ranges.monthly.range.from, ranges.monthly.range.to) : ''}
          stats={ranges?.monthly.stats}
          emptyMessage={ranges ? emptyRangeMessage(ranges.monthly.range) : ''}
        />
      </div>

      {series.isError ? (
        <ErrorState message={series.error.message} onRetry={series.refetch} />
      ) : (
        <MonthChart
          month={monthOf(date)}
          readings={series.data}
          refreshing={series.isPlaceholderData}
        />
      )}
    </div>
  );
}
