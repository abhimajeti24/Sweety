// A modal built on the native <dialog> element: the browser traps focus, makes the page behind it
// inert and closes it on Escape. On close, focus goes back to the button that opened it.
import { useEffect, useId, useRef } from 'react';
import { XIcon } from '@phosphor-icons/react';
import { IconButton } from '../Button/Button.jsx';
import styles from './Dialog.module.css';

/**
 * Render it only while it should be open; unmounting closes it.
 * @param {object} props
 * @param {string} props.title
 * @param {() => void} props.onClose called when the user closes it (Escape, the X, or Cancel)
 */
export function Dialog({ title, onClose, children }) {
  const dialogRef = useRef(null);
  const openerRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    openerRef.current ??= document.activeElement;
    if (!dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }
    dialog.querySelector('[data-autofocus]')?.focus();

    return () => {
      const opener = openerRef.current;
      // The opener may be gone (for example the delete button of a deleted reading).
      const target = opener?.isConnected ? opener : document.getElementById('main');
      target?.focus();
    };
  }, []);

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby={titleId} onClose={onClose}>
      <div className={styles.header}>
        <h2 id={titleId}>{title}</h2>
        <IconButton icon={XIcon} label="Close" onClick={onClose} />
      </div>
      {children}
    </dialog>
  );
}
