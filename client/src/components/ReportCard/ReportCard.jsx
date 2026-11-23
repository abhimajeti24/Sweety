// One report (Daily, Month-to-date or Monthly): its range and score line ("59 of 60 logged"), the
// four stats, and for the daily card the readings themselves. With no readings the score line
// already says so, and a short sentence says what to do next.
import { useId } from 'react';
import { MAX_READINGS_PER_DAY, countDaysInclusive } from '@sweety/shared';
import { EmptyState } from '../EmptyState/EmptyState.jsx';
import { ReadingList } from '../ReadingList/ReadingList.jsx';
import { ScoreLine } from '../ScoreLine/ScoreLine.jsx';
import { Skeleton } from '../Skeleton/Skeleton.jsx';
import { StatGrid } from '../StatGrid/StatGrid.jsx';
import styles from './ReportCard.module.css';

/**
 * @param {object} props
 * @param {string} props.title 'Daily', 'Month-to-date', 'Monthly' or 'Day summary'
 * @param {{ from: string, to: string } | undefined} props.range drives the score line capacity
 * @param {string} props.rangeLabel for example '1 Oct to 15 Oct 2026'
 * @param {{ count: number, highest: number, lowest: number, average: number } | undefined} props.stats
 * @param {object[]} [props.readings] listed under the stats (daily card)
 * @param {string} props.emptyMessage
 * @param {import('react').ReactNode} [props.emptyAction]
 */
export function ReportCard({
  title,
  range,
  rangeLabel,
  stats,
  readings,
  emptyMessage,
  emptyAction,
}) {
  const headingId = useId();
  const capacity = range ? countDaysInclusive(range.from, range.to) * MAX_READINGS_PER_DAY : null;

  let body;
  if (!stats) {
    body = (
      <div className={styles.loading} aria-hidden="true">
        <Skeleton height={64} />
        <Skeleton height={64} />
      </div>
    );
  } else if (stats.count === 0) {
    body = <EmptyState compact message={emptyMessage} action={emptyAction} />;
  } else {
    body = (
      <>
        <StatGrid stats={stats} />
        {readings && readings.length > 0 && (
          <div className={styles.readings}>
            <h3 className="visually-hidden">Readings</h3>
            <ReadingList readings={readings} />
          </div>
        )}
      </>
    );
  }

  return (
    <article className={styles.card} aria-labelledby={headingId} aria-busy={!stats || undefined}>
      <header className={styles.header}>
        {/* The same lines on every card in a row (tab and score, then the range), so the stats
            below start at the same height across the row. */}
        <div className={styles.titleRow}>
          <h2 id={headingId} className={styles.title}>
            {title}
          </h2>
          {stats && capacity && <ScoreLine logged={stats.count} capacity={capacity} />}
        </div>
        <p className={`${styles.range} mono`}>{rangeLabel}</p>
      </header>
      {body}
    </article>
  );
}
