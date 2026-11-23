// Home for patients: the day's score line and slot tiles, the day's stats, and quick add.
// The date lives in the URL (?date=) so back, forward and refresh keep it.
import { useState } from 'react';
import { ChartLineIcon, PlusIcon } from '@phosphor-icons/react';
import { formatDisplayDate, slotLabel, weekdayName } from '@sweety/shared';
import { Button, ButtonLink } from '../../components/Button/Button.jsx';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog.jsx';
import { DateControl } from '../../components/DateControl/DateControl.jsx';
import { DayStrip } from '../../components/DayStrip/DayStrip.jsx';
import { ErrorState } from '../../components/ErrorState/ErrorState.jsx';
import { ReadingDialog } from '../../components/ReadingDialog/ReadingDialog.jsx';
import { ReportCard } from '../../components/ReportCard/ReportCard.jsx';
import { useToast } from '../../components/Toast/Toast.jsx';
import { useDayReadings, useDeleteReading, useToday } from '../../hooks/useReadings.js';
import { useReports } from '../../hooks/useReports.js';
import { useSelectedDate } from '../../hooks/useSelectedDate.js';
import { firstEmptySlot } from '../../lib/readingRules.js';
import styles from './TodayPage.module.css';

export function TodayPage() {
  const today = useToday();
  const [date, setDate] = useSelectedDate(today);
  const day = useDayReadings(date);
  const report = useReports(date);
  const deleteReading = useDeleteReading();
  const { showToast } = useToast();
  const [dialog, setDialog] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const readings = day.data;
  const nextSlot = readings ? firstEmptySlot(readings) : null;
  const isToday = date === today;
  const dailyStats = report.data?.selectedDate === date ? report.data.daily.stats : undefined;

  const openAdd = (slot = nextSlot ?? '') => setDialog({ defaultSlot: slot, defaultDate: date });

  async function confirmDelete() {
    await deleteReading.mutateAsync(pendingDelete.id);
    showToast('Reading deleted.');
  }

  return (
    <div className={styles.page}>
      <title>{isToday ? 'Today | Sweety' : `${formatDisplayDate(date)} | Sweety`}</title>

      <header className={styles.header}>
        <div className={styles.heading}>
          <h1>{isToday ? 'Today' : weekdayName(date)}</h1>
          <p className={`${styles.date} mono`}>
            {isToday ? `${weekdayName(date)} ${formatDisplayDate(date)}` : formatDisplayDate(date)}
          </p>
        </div>
        <div className={styles.tools}>
          <DateControl value={date} max={today} onChange={setDate} />
          {/* Stays visible on a full day, so trying a fifth reading explains the daily limit. */}
          <Button icon={PlusIcon} onClick={() => openAdd()}>
            Add reading
          </Button>
        </div>
      </header>

      {day.isError ? (
        <ErrorState message={day.error.message} onRetry={day.refetch} />
      ) : (
        <DayStrip
          readings={readings}
          onAdd={openAdd}
          onEdit={(reading) => setDialog({ reading })}
          onDelete={setPendingDelete}
        />
      )}

      {report.isError ? (
        <ErrorState message={report.error.message} onRetry={report.refetch} />
      ) : (
        <ReportCard
          title="Day summary"
          rangeLabel={formatDisplayDate(date)}
          stats={dailyStats}
          emptyMessage={`Nothing logged on ${formatDisplayDate(date)} yet. Add your ${slotLabel(
            nextSlot ?? 'morning_fasting',
          )} reading to start the day.`}
          emptyAction={
            <Button variant="secondary" size="sm" icon={PlusIcon} onClick={() => openAdd()}>
              Add reading
            </Button>
          }
        />
      )}

      <p className={styles.reportsLink}>
        <ButtonLink to={`/reports?date=${date}`} variant="ghost" icon={ChartLineIcon}>
          See reports for {formatDisplayDate(date)}
        </ButtonLink>
      </p>

      {dialog && <ReadingDialog {...dialog} onClose={() => setDialog(null)} />}
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
