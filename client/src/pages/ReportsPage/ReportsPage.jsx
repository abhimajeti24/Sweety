// Reports for a chosen date: Daily, Month-to-date (1st of the month to the date) and Monthly
// (the whole previous month), plus the month's chart. The date lives in the URL.
import { useState } from 'react';
import { formatDisplayDate, monthOf } from '@sweety/shared';
import { DateControl } from '../../components/DateControl/DateControl.jsx';
import { ReadingDialog } from '../../components/ReadingDialog/ReadingDialog.jsx';
import { ReportsPanel } from '../../components/ReportsPanel/ReportsPanel.jsx';
import { useToday } from '../../hooks/useReadings.js';
import { useMonthSeries, useReports } from '../../hooks/useReports.js';
import { useSelectedDate } from '../../hooks/useSelectedDate.js';
import styles from './ReportsPage.module.css';

export function ReportsPage() {
  const today = useToday();
  const [date, setDate] = useSelectedDate(today);
  const reports = useReports(date);
  const series = useMonthSeries(monthOf(date));
  const [addSlot, setAddSlot] = useState(null);

  return (
    <div className={styles.page}>
      <title>{`Reports for ${formatDisplayDate(date)} | Sweety`}</title>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h1>Reports</h1>
          <p className={styles.sub}>
            For <span className="mono">{formatDisplayDate(date)}</span>
          </p>
        </div>
        <DateControl value={date} max={today} onChange={setDate} label="Report date" />
      </header>

      <ReportsPanel date={date} reports={reports} series={series} onAddReading={setAddSlot} />

      {addSlot && (
        <ReadingDialog defaultDate={date} defaultSlot={addSlot} onClose={() => setAddSlot(null)} />
      )}
    </div>
  );
}
