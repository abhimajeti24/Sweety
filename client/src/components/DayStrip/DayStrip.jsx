// The signature element: the day's score line ("2 of 4 logged" and a four-segment bar) above four
// slot tiles in meal order. A filled tile shows its value; an empty one offers to add it.
import { useId } from 'react';
import { PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { MAX_READINGS_PER_DAY, SLOTS, UNIT } from '@sweety/shared';
import { Button, IconButton } from '../Button/Button.jsx';
import { RangeBadge } from '../RangeBadge/RangeBadge.jsx';
import { Skeleton } from '../Skeleton/Skeleton.jsx';
import styles from './DayStrip.module.css';

/** "2 of 4 logged" plus a segment per slot, filled in meal order where a reading exists. */
export function ScoreLine({ readings, headingId }) {
  const logged = new Set(readings.map((reading) => reading.slot));
  const full = logged.size >= MAX_READINGS_PER_DAY;
  return (
    <div className={styles.score}>
      <h2 id={headingId} className={styles.scoreText}>
        {full ? (
          `All ${MAX_READINGS_PER_DAY} logged`
        ) : (
          <>
            <span className="mono">{logged.size}</span> of {MAX_READINGS_PER_DAY} logged
          </>
        )}
      </h2>
      <div className={styles.segments} aria-hidden="true">
        {SLOTS.map((slot) => (
          <span
            key={slot.key}
            className={`${styles.segment} ${logged.has(slot.key) ? styles.segmentFilled : ''}`}
          />
        ))}
      </div>
    </div>
  );
}

function FilledTile({ slot, reading, readOnly, onEdit, onDelete }) {
  return (
    <li className={`${styles.tile} ${styles.filled}`}>
      <p className={styles.slotLabel}>
        <span className={styles.loggedMark} aria-hidden="true" />
        {slot.label}
      </p>
      <div className={styles.valueBlock}>
        <p className={styles.value}>
          <span className="mono">{reading.value}</span>
          <span className={styles.unit}>{UNIT}</span>
        </p>
        <RangeBadge value={reading.value} />
      </div>
      {!readOnly && (
        <div className={styles.tileActions}>
          <IconButton
            icon={PencilSimpleIcon}
            label={`Edit ${slot.label} reading`}
            onClick={() => onEdit(reading)}
          />
          <IconButton
            icon={TrashIcon}
            variant="danger"
            label={`Delete ${slot.label} reading`}
            onClick={() => onDelete(reading)}
          />
        </div>
      )}
    </li>
  );
}

function EmptyTile({ slot, readOnly, onAdd }) {
  return (
    <li className={`${styles.tile} ${styles.empty}`}>
      <p className={styles.slotLabel}>{slot.label}</p>
      <p className={styles.missing}>Not logged</p>
      {!readOnly && (
        <div className={styles.tileActions}>
          <Button
            variant="secondary"
            size="sm"
            icon={PlusIcon}
            onClick={() => onAdd(slot.key)}
            aria-label={`Add ${slot.label} reading`}
          >
            Add
          </Button>
        </div>
      )}
    </li>
  );
}

/**
 * @param {object} props
 * @param {Array<{ id: number, slot: string, value: number }>} [props.readings] undefined while loading
 * @param {boolean} [props.readOnly] hides add, edit and delete (doctor view)
 */
export function DayStrip({ readings, readOnly = false, onAdd, onEdit, onDelete }) {
  const headingId = useId();

  if (!readings) {
    return (
      <div className={styles.strip} aria-busy="true">
        <Skeleton width={160} height={24} />
        <ul className={styles.tiles}>
          {SLOTS.map((slot) => (
            <li key={slot.key}>
              <Skeleton height={164} radius="var(--radius-card)" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const bySlot = new Map(readings.map((reading) => [reading.slot, reading]));
  return (
    <section className={styles.strip} aria-labelledby={headingId}>
      <ScoreLine readings={readings} headingId={headingId} />
      <ul className={styles.tiles}>
        {SLOTS.map((slot) => {
          const reading = bySlot.get(slot.key);
          return reading ? (
            <FilledTile
              key={slot.key}
              slot={slot}
              reading={reading}
              readOnly={readOnly}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ) : (
            <EmptyTile key={slot.key} slot={slot} readOnly={readOnly} onAdd={onAdd} />
          );
        })}
      </ul>
    </section>
  );
}
