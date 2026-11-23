// Highest, lowest, average (one decimal) and count, as a compact row of fixed-width figures.
import { UNIT, formatAverage } from '@sweety/shared';
import styles from './StatGrid.module.css';

/** @param {{ stats: { count: number, highest: number, lowest: number, average: number } }} props */
export function StatGrid({ stats }) {
  const items = [
    { label: 'Highest', value: stats.highest, unit: UNIT },
    { label: 'Lowest', value: stats.lowest, unit: UNIT },
    { label: 'Average', value: formatAverage(stats.average), unit: UNIT },
    { label: 'Readings', value: stats.count },
  ];
  return (
    <div className={styles.container}>
      <dl className={styles.grid}>
        {items.map((item) => (
          <div key={item.label} className={styles.item}>
            <dt className={styles.label}>{item.label}</dt>
            <dd className={styles.value}>
              <span className="mono">{item.value}</span>
              {item.unit && <span className={styles.unit}>{item.unit}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
