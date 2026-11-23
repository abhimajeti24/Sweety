// A list of readings in scorecard columns: slot, value, range badge, and optional edit and delete.
import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { UNIT } from '@sweety/shared';
import { IconButton } from '../Button/Button.jsx';
import { RangeBadge } from '../RangeBadge/RangeBadge.jsx';
import styles from './ReadingList.module.css';

/**
 * @param {object} props
 * @param {Array<{ id: number, slot: string, slotLabel: string, value: number }>} props.readings
 * @param {(reading: object) => void} [props.onEdit]
 * @param {(reading: object) => void} [props.onDelete]
 */
export function ReadingList({ readings, onEdit, onDelete }) {
  const editable = Boolean(onEdit || onDelete);
  return (
    <div className={styles.container}>
      <ul className={`${styles.list} ${editable ? styles.editable : ''}`}>
        {readings.map((reading) => (
          <li key={reading.id} className={styles.row}>
            <span className={styles.slot}>{reading.slotLabel}</span>
            <span className={styles.value}>
              <span className="mono">{reading.value}</span>
              <span className={styles.unit}>{UNIT}</span>
            </span>
            <span className={styles.badge}>
              <RangeBadge value={reading.value} />
            </span>
            {editable && (
              <span className={styles.actions}>
                {onEdit && (
                  <IconButton
                    icon={PencilSimpleIcon}
                    label={`Edit ${reading.slotLabel} reading`}
                    onClick={() => onEdit(reading)}
                  />
                )}
                {onDelete && (
                  <IconButton
                    icon={TrashIcon}
                    variant="danger"
                    label={`Delete ${reading.slotLabel} reading`}
                    onClick={() => onDelete(reading)}
                  />
                )}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
