// One assigned patient's reports and chart for a chosen date, read-only.
import { useParams } from 'react-router';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { formatDisplayDate, monthOf } from '@sweety/shared';
import { ButtonLink } from '../../components/Button/Button.jsx';
import { DateControl } from '../../components/DateControl/DateControl.jsx';
import { EmptyState } from '../../components/EmptyState/EmptyState.jsx';
import { ReportsPanel } from '../../components/ReportsPanel/ReportsPanel.jsx';
import { Skeleton } from '../../components/Skeleton/Skeleton.jsx';
import { usePatientReports, usePatientSeries, usePatients } from '../../hooks/useDoctor.js';
import { useToday } from '../../hooks/useReadings.js';
import { useSelectedDate } from '../../hooks/useSelectedDate.js';
import styles from './DoctorPatientPage.module.css';

export function DoctorPatientPage() {
  const { id } = useParams();
  const today = useToday();
  const [date, setDate] = useSelectedDate(today);
  const patients = usePatients();
  const reports = usePatientReports(id, date);
  const series = usePatientSeries(id, monthOf(date));
  const patient = patients.data?.find((candidate) => String(candidate.id) === id);
  const notFound = reports.error?.status === 404 || (patients.data && !patient);

  const back = (
    <ButtonLink to="/doctor" variant="ghost" size="sm" icon={ArrowLeftIcon}>
      All patients
    </ButtonLink>
  );

  if (notFound) {
    return (
      <div className={styles.page}>
        <title>Patient not found | Sweety</title>
        {back}
        <EmptyState message="This patient is not on your list." />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <title>{`${patient?.name ?? 'Patient'} | Sweety`}</title>
      <div className={styles.back}>{back}</div>
      <header className={styles.header}>
        <div className={styles.heading}>
          {patient ? <h1>{patient.name}</h1> : <Skeleton width={220} height={36} />}
          <p className={styles.sub}>
            {patient?.email} · Reports for <span className="mono">{formatDisplayDate(date)}</span>
          </p>
        </div>
        <DateControl value={date} max={today} onChange={setDate} label="Report date" />
      </header>
      <ReportsPanel date={date} reports={reports} series={series} />
    </div>
  );
}
