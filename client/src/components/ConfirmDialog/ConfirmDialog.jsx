// "Are you sure?" for destructive actions, such as deleting a reading.
import { useState } from 'react';
import { Button } from '../Button/Button.jsx';
import { Dialog } from '../Dialog/Dialog.jsx';
import { ErrorState } from '../ErrorState/ErrorState.jsx';
import styles from './ConfirmDialog.module.css';

/**
 * Render only while open.
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.message
 * @param {string} props.confirmLabel
 * @param {() => Promise<void>} props.onConfirm the dialog closes itself only when this succeeds
 * @param {() => void} props.onClose
 */
export function ConfirmDialog({ title, message, confirmLabel, onConfirm, onClose }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  async function handleConfirm() {
    setPending(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (failure) {
      setError(failure.message);
      setPending(false);
    }
  }

  return (
    <Dialog title={title} onClose={onClose}>
      <div className={styles.body}>
        <p>{message}</p>
        {error && <ErrorState message={error} />}
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onClose} data-autofocus>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            pending={pending}
            pendingLabel="Deleting..."
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
