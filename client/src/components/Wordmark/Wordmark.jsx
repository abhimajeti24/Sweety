// The Sweety wordmark and its one quiet motif: four rounded segments, one per daily slot.
import styles from './Wordmark.module.css';

/** Four segments, the first `filled` in Turquesa and the rest in Lavanda. Decorative only. */
export function SlotMotif({ filled = 2, className }) {
  return (
    <svg
      className={[styles.motif, className].filter(Boolean).join(' ')}
      viewBox="0 0 44 12"
      aria-hidden="true"
      focusable="false"
    >
      {[0, 1, 2, 3].map((index) => (
        <rect
          key={index}
          x={index * 11}
          y="0"
          width="9"
          height="12"
          rx="4.5"
          fill={index < filled ? 'var(--turquesa)' : 'var(--lavanda)'}
        />
      ))}
    </svg>
  );
}

export function Wordmark({ size = 'md' }) {
  return (
    <span className={`${styles.wordmark} ${styles[size]}`}>
      <SlotMotif className={styles.wordmarkMotif} />
      <span>Sweety</span>
    </span>
  );
}
