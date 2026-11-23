// Grey placeholder blocks shaped like the content that is loading.
import styles from './Skeleton.module.css';

export function Skeleton({ width = '100%', height = 16, radius, className }) {
  return (
    <span
      className={[styles.skeleton, className].filter(Boolean).join(' ')}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}
