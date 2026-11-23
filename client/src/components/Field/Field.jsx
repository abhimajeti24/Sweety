// A labelled form control with optional hint, unit suffix and error message. The error is linked
// to the control with aria-describedby and the control is marked aria-invalid, so screen readers
// announce the problem together with the field.
import { useState } from 'react';
import { EyeIcon, EyeSlashIcon, WarningCircleIcon } from '@phosphor-icons/react';
import styles from './Field.module.css';

/**
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.label
 * @param {string} [props.error]
 * @param {string} [props.hint]
 * @param {string} [props.suffix] unit shown inside the control, for example 'mg/dl'
 * @param {(controlProps: object) => import('react').ReactNode} props.children renders the control
 */
export function Field({ id, label, error, hint, suffix, children }) {
  const hintId = hint ? `${id}-hint` : null;
  const suffixId = suffix ? `${id}-suffix` : null;
  const errorId = error ? `${id}-error` : null;
  const describedBy = [suffixId, hintId, errorId].filter(Boolean).join(' ') || undefined;

  const controlProps = {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    className: [styles.control, suffix && styles.withSuffix, error && styles.invalid]
      .filter(Boolean)
      .join(' '),
  };

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.controlWrap}>
        {children(controlProps)}
        {suffix && (
          <span id={suffixId} className={`${styles.suffix} mono`}>
            {suffix}
          </span>
        )}
      </div>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          <WarningCircleIcon
            size={18}
            weight="fill"
            aria-hidden="true"
            className={styles.errorIcon}
          />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

/** Password input with a show/hide toggle. Takes the control props Field hands to its child. */
export function PasswordInput({ className, ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <input
        {...props}
        className={`${className} ${styles.withToggle}`}
        type={visible ? 'text' : 'password'}
      />
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setVisible((shown) => !shown)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        {visible ? (
          <EyeSlashIcon size={20} aria-hidden="true" />
        ) : (
          <EyeIcon size={20} aria-hidden="true" />
        )}
      </button>
    </>
  );
}
