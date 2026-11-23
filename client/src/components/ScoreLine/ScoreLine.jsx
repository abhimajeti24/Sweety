// The signature "score line": logged out of possible, set in Martian Mono like a live score.
// On Today it also carries one segment per slot, filled in meal order where a reading exists.
import { MAX_READINGS_PER_DAY, SLOTS } from '@sweety/shared';
import styles from './ScoreLine.module.css';

/**
 * @param {object} props
 * @param {number} props.logged
 * @param {number} [props.capacity] readings possible in the range (4 per day)
 * @param {Set<string>} [props.loggedSlots] when given, draws the four slot segments
 * @param {'lg' | 'sm'} [props.size]
 * @param {'h2' | 'h3' | 'p'} [props.as] the element, so it can be a heading where it leads a section
 */
export function ScoreLine({
  logged,
  capacity = MAX_READINGS_PER_DAY,
  loggedSlots,
  size = 'sm',
  as: Tag = 'p',
  id,
}) {
  const full = logged >= capacity && capacity === MAX_READINGS_PER_DAY;
  return (
    <div className={`${styles.score} ${styles[size]}`}>
      <Tag id={id} className={`${styles.text} mono`}>
        {full ? (
          `All ${MAX_READINGS_PER_DAY} logged`
        ) : (
          <>
            <span className={styles.logged}>{logged}</span> of {capacity} logged
          </>
        )}
      </Tag>
      {loggedSlots && (
        <span className={styles.segments} aria-hidden="true">
          {SLOTS.map((slot) => (
            <span
              key={slot.key}
              className={`${styles.segment} ${loggedSlots.has(slot.key) ? styles.filled : ''}`}
            />
          ))}
        </span>
      )}
    </div>
  );
}
