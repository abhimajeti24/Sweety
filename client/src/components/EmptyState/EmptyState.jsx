// A friendly "nothing here yet" message that says what to do next.
import { SlotMotif } from '../Wordmark/Wordmark.jsx';
import styles from './EmptyState.module.css';

/**
 * @param {object} props
 * @param {string} props.message specific, kind copy, for example "Nothing logged on 15 Oct 2026 yet."
 * @param {import('react').ReactNode} [props.action] usually a Button
 * @param {boolean} [props.compact] smaller padding for use inside a card
 */
export function EmptyState({ message, action, compact = false }) {
  return (
    <div className={`${styles.empty} ${compact ? styles.compact : ''}`}>
      <SlotMotif filled={0} className={styles.motif} />
      <p className={styles.message}>{message}</p>
      {action}
    </div>
  );
}
