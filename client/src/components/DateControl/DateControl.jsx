// Previous day, a date picker and next day. Never lets the user step past `max` (today).
import { useId } from 'react';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { addDays, isValidIsoDate } from '@sweety/shared';
import { Button, IconButton } from '../Button/Button.jsx';
import styles from './DateControl.module.css';

export function DateControl({ value, max, onChange, label = 'Date' }) {
  const id = useId();
  const atMax = value >= max;

  function handleInput(event) {
    const next = event.target.value;
    if (isValidIsoDate(next) && next <= max) onChange(next);
  }

  return (
    <div className={styles.control}>
      <IconButton
        icon={CaretLeftIcon}
        label="Previous day"
        onClick={() => onChange(addDays(value, -1))}
      />
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <input
        id={id}
        className={`${styles.input} mono`}
        type="date"
        value={value}
        max={max}
        onChange={handleInput}
      />
      <IconButton
        icon={CaretRightIcon}
        label="Next day"
        disabled={atMax}
        onClick={() => onChange(addDays(value, 1))}
      />
      {!atMax && (
        <Button variant="ghost" size="sm" onClick={() => onChange(max)}>
          Today
        </Button>
      )}
    </div>
  );
}
