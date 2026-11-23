// Buttons in four variants (primary, secondary, ghost, danger). ButtonLink looks the same but navigates.
import { Link } from 'react-router';
import styles from './Button.module.css';

/** @param {'primary' | 'secondary' | 'ghost' | 'danger'} variant @param {'md' | 'sm'} size */
export function buttonClassName({ variant = 'primary', size = 'md', block = false, className }) {
  return [styles.button, styles[variant], styles[size], block && styles.block, className]
    .filter(Boolean)
    .join(' ');
}

/**
 * @param {object} props
 * @param {boolean} [props.pending] shows `pendingLabel` and blocks clicks while work is in flight
 * @param {import('react').ComponentType<any>} [props.icon] a Phosphor icon shown before the label
 */
export function Button({
  variant,
  size,
  block,
  className,
  icon: Icon,
  pending = false,
  pendingLabel,
  disabled,
  type = 'button',
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, block, className })}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      {...rest}
    >
      {Icon && <Icon size={size === 'sm' ? 18 : 20} weight="bold" aria-hidden="true" />}
      <span>{pending && pendingLabel ? pendingLabel : children}</span>
    </button>
  );
}

export function ButtonLink({ variant, size, block, className, icon: Icon, children, ...rest }) {
  return (
    <Link className={buttonClassName({ variant, size, block, className })} {...rest}>
      {Icon && <Icon size={size === 'sm' ? 18 : 20} weight="bold" aria-hidden="true" />}
      <span>{children}</span>
    </Link>
  );
}

/** A square icon-only button. `label` is required because there is no visible text. */
export function IconButton({ icon: Icon, label, variant = 'ghost', className, ...rest }) {
  return (
    <button
      type="button"
      className={[styles.iconButton, styles[variant], className].filter(Boolean).join(' ')}
      aria-label={label}
      title={label}
      {...rest}
    >
      <Icon size={20} weight="bold" aria-hidden="true" />
    </button>
  );
}
