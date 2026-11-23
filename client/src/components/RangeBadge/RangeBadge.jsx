// "Low", "In range" or "High" next to a value, using general reference thresholds. Always text plus
// an icon, never colour alone. Informational only: pages that show it carry the disclaimer.
import { ArrowDownIcon, ArrowUpIcon, CheckIcon } from '@phosphor-icons/react';
import { RANGE_HIGH_ABOVE, RANGE_LOW_BELOW } from '@sweety/shared';
import styles from './RangeBadge.module.css';

export const RANGE_DISCLAIMER = `Low is below ${RANGE_LOW_BELOW} mg/dl and High is above ${RANGE_HIGH_ABOVE} mg/dl. General reference ranges for information only, not medical advice.`;

/** @returns {'low' | 'in' | 'high'} */
export function rangeOf(value) {
  if (value < RANGE_LOW_BELOW) return 'low';
  if (value > RANGE_HIGH_ABOVE) return 'high';
  return 'in';
}

const BADGES = {
  low: { label: 'Low', icon: ArrowDownIcon },
  in: { label: 'In range', icon: CheckIcon },
  high: { label: 'High', icon: ArrowUpIcon },
};

export function RangeBadge({ value }) {
  const range = rangeOf(value);
  const { label, icon: Icon } = BADGES[range];
  return (
    <span className={`${styles.badge} ${styles[range]}`}>
      <Icon size={12} weight="bold" aria-hidden="true" />
      {label}
    </span>
  );
}

/** The disclaimer shown on every page that shows range badges. */
export function RangeNote() {
  return <p className={styles.note}>{RANGE_DISCLAIMER}</p>;
}
