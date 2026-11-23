// One report (Daily, Month-to-date or Monthly): its range, the four stats, and for the daily card
// the readings themselves. With no readings it shows a friendly empty state instead.
import { useId } from 'react';
import { EmptyState } from '../EmptyState/EmptyState.jsx';
import { ReadingList } from '../ReadingList/ReadingList.jsx';
import { Skeleton } from '../Skeleton/Skeleton.jsx';
import { StatGrid } from '../StatGrid/StatGrid.jsx';
import styles from './ReportCard.module.css';

/**
 * @param {object} props
 * @param {string} props.title 'Daily', 'Month-to-date' or 'Monthly'
 * @param {string} props.rangeLabel for example '1 Oct to 15 Oct 2026'
 * @param {{ count: number, highest: number, lowest: number, average: number } | undefined} props.stats
 * @param {object[]} [props.readings] listed under the stats (daily card)
 * @param {string} props.emptyMessage
 * @param {import('react').ReactNode} [props.emptyAction]
 */
export function ReportCard({ title, rangeLabel, stats, readings, emptyMessage, emptyAction }) {
  const headingId = useId();

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
        <h2 id={headingId} className={styles.title}>
          {title}
        </h2>
        <p className={`${styles.range} mono`}>{rangeLabel}</p>
      </header>
      {body}
    </article>
  );
}
