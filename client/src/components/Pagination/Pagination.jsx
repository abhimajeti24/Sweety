// Page numbers with previous and next. Long ranges collapse to 1 ... 4 5 6 ... 10.
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import styles from './Pagination.module.css';

/** The page numbers to show, with null where a gap ("...") goes. */
export function pageItems(page, totalPages) {
  const wanted = new Set([1, totalPages, page - 1, page, page + 1]);
  const pages = [...wanted].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const items = [];
  for (const [index, n] of pages.entries()) {
    if (index > 0 && n - pages[index - 1] > 1) items.push(null);
    items.push(n);
  }
  return items;
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav className={styles.nav} aria-label="Pagination">
      <button
        type="button"
        className={styles.step}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        <CaretLeftIcon size={18} weight="bold" aria-hidden="true" />
        <span>Previous</span>
      </button>
      <ol className={styles.pages}>
        {pageItems(page, totalPages).map((n, index) =>
          n === null ? (
            <li key={`gap-${index}`} className={styles.gap} aria-hidden="true">
              ...
            </li>
          ) : (
            <li key={n}>
              <button
                type="button"
                className={`${styles.page} mono`}
                aria-current={n === page ? 'page' : undefined}
                aria-label={`Page ${n}`}
                onClick={() => onChange(n)}
              >
                {n}
              </button>
            </li>
          ),
        )}
      </ol>
      <button
        type="button"
        className={styles.step}
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
      >
        <span>Next</span>
        <CaretRightIcon size={18} weight="bold" aria-hidden="true" />
      </button>
    </nav>
  );
}
