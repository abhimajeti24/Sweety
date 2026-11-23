// Every reading, newest first, 20 per page, grouped by date, with a month filter.
// Page and month live in the URL so refresh and back keep the place.
import { useEffect, useId, useState } from 'react';
import { useSearchParams } from 'react-router';
import { PlusIcon } from '@phosphor-icons/react';
import {
  formatDisplayDate,
  formatMonthLabel,
  formatRange,
  getMonthRange,
  isValidIsoMonth,
  monthOf,
  weekdayName,
} from '@sweety/shared';
import { ButtonLink } from '../../components/Button/Button.jsx';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog.jsx';
import { EmptyState } from '../../components/EmptyState/EmptyState.jsx';
import { ErrorState } from '../../components/ErrorState/ErrorState.jsx';
import { Pagination } from '../../components/Pagination/Pagination.jsx';
import { ReadingDialog } from '../../components/ReadingDialog/ReadingDialog.jsx';
import { ReadingList } from '../../components/ReadingList/ReadingList.jsx';
import { Skeleton } from '../../components/Skeleton/Skeleton.jsx';
import { useToast } from '../../components/Toast/Toast.jsx';
import { useDeleteReading, useReadingsPage, useToday } from '../../hooks/useReadings.js';
import styles from './HistoryPage.module.css';

const MONTHS_TO_OFFER = 24;

/** This month and the previous 23, newest first, as 'YYYY-MM'. */
function recentMonths(today) {
  const [year, month] = monthOf(today).split('-').map(Number);
  return Array.from({ length: MONTHS_TO_OFFER }, (_, index) => {
    const total = year * 12 + (month - 1) - index;
    return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
  });
}

/** [{ date, readings }] in the order the readings arrive (newest date first). */
function groupByDate(readings) {
  const groups = [];
  for (const reading of readings) {
    const last = groups.at(-1);
    if (last?.date === reading.date) last.readings.push(reading);
    else groups.push({ date: reading.date, readings: [reading] });
  }
  return groups;
}

export function HistoryPage() {
  const today = useToday();
  const filterId = useId();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number.parseInt(searchParams.get('page'), 10) || 1);
  const month = isValidIsoMonth(searchParams.get('month')) ? searchParams.get('month') : '';
  const range = month ? getMonthRange(month) : {};

  const query = useReadingsPage({ page, from: range.from, to: range.to });
  const deleteReading = useDeleteReading();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  function setParams(next) {
    const params = {};
    if (next.month) params.month = next.month;
    if (next.page > 1) params.page = String(next.page);
    setSearchParams(params);
  }

  const totalPages = query.data?.pagination.totalPages ?? 0;
  // Deleting the last reading on the last page leaves an empty page: step back to the new last one.
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setParams({ month, page: totalPages });
  });

  async function confirmDelete() {
    await deleteReading.mutateAsync(pendingDelete.id);
    showToast('Reading deleted.');
  }

  const readings = query.data?.data ?? [];
  const groups = groupByDate(readings);
  const total = query.data?.pagination.total ?? 0;

  let body;
  if (query.isError) {
    body = <ErrorState message={query.error.message} onRetry={query.refetch} />;
  } else if (!query.data) {
    body = (
      <div className={styles.loading} aria-busy="true">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} height={180} radius="var(--radius-card)" />
        ))}
      </div>
    );
  } else if (readings.length === 0) {
    body = (
      <EmptyState
        message={
          month
            ? `No readings in ${formatMonthLabel(month)}. Pick another month or add one from Today.`
            : 'No readings yet. Your first one is a tap away on Today.'
        }
        action={
          <ButtonLink to="/" variant="secondary" size="sm" icon={PlusIcon}>
            Add a reading
          </ButtonLink>
        }
      />
    );
  } else {
    body = (
      <>
        <ol className={styles.groups} aria-busy={query.isPlaceholderData || undefined}>
          {groups.map((group) => (
            <li key={group.date} className={styles.group}>
              <h2 className={styles.groupDate}>
                <span className="mono">{formatDisplayDate(group.date)}</span>
                <span className={styles.weekday}>{weekdayName(group.date)}</span>
              </h2>
              <ReadingList
                readings={group.readings}
                onEdit={setEditing}
                onDelete={setPendingDelete}
              />
            </li>
          ))}
        </ol>
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={(next) => {
            setParams({ month, page: next });
            window.scrollTo({ top: 0 });
          }}
        />
      </>
    );
  }

  return (
    <div className={styles.page}>
      <title>History | Sweety</title>
      <header className={styles.header}>
        <h1>History</h1>
        <div className={styles.filter}>
          <label htmlFor={filterId}>Month</label>
          <select
            id={filterId}
            className={styles.select}
            value={month}
            onChange={(event) => setParams({ month: event.target.value, page: 1 })}
          >
            <option value="">All months</option>
            {recentMonths(today).map((value) => (
              <option key={value} value={value}>
                {formatMonthLabel(value)}
              </option>
            ))}
          </select>
        </div>
      </header>

      {readings.length > 0 && (
        <p className={styles.guide}>
          <span className="mono">{formatRange(readings.at(-1).date, readings[0].date)}</span>
          <span>
            Page {page} of {totalPages}, {total} {total === 1 ? 'reading' : 'readings'}
          </span>
        </p>
      )}

      {body}

      {editing && <ReadingDialog reading={editing} onClose={() => setEditing(null)} />}
      {pendingDelete && (
        <ConfirmDialog
          title="Delete reading"
          message={`Delete the ${pendingDelete.slotLabel} reading for ${formatDisplayDate(
            pendingDelete.date,
          )}?`}
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onClose={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
