// Inline error for a section that failed to load, with a Retry button.
import { ArrowClockwiseIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { Button } from '../Button/Button.jsx';
import styles from './ErrorState.module.css';

export function ErrorState({ message, onRetry }) {
  return (
    <div className={styles.error} role="alert">
      <WarningCircleIcon size={24} weight="fill" aria-hidden="true" className={styles.icon} />
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={ArrowClockwiseIcon} onClick={() => onRetry()}>
          Retry
        </Button>
      )}
    </div>
  );
}
