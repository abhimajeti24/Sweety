// A doctor's home: the patients assigned to them, each linking to their reports.
import { Link } from 'react-router';
import { CaretRightIcon } from '@phosphor-icons/react';
import { EmptyState } from '../../components/EmptyState/EmptyState.jsx';
import { ErrorState } from '../../components/ErrorState/ErrorState.jsx';
import { Skeleton } from '../../components/Skeleton/Skeleton.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePatients } from '../../hooks/useDoctor.js';
import styles from './DoctorPatientsPage.module.css';

export function DoctorPatientsPage() {
  const { user } = useAuth();
  const patients = usePatients();

  let body;
  if (patients.isError) {
    body = <ErrorState message={patients.error.message} onRetry={patients.refetch} />;
  } else if (!patients.data) {
    body = <Skeleton height={72} radius="var(--radius-card)" />;
  } else if (patients.data.length === 0) {
    body = <EmptyState message="No patients are assigned to you yet." />;
  } else {
    body = (
      <ul className={styles.list}>
        {patients.data.map((patient) => (
          <li key={patient.id}>
            <Link className={styles.row} to={`/doctor/patients/${patient.id}`}>
              <span className={styles.who}>
                <span className={styles.name}>{patient.name}</span>
                <span className={styles.email}>{patient.email}</span>
              </span>
              <span className={styles.action}>
                View reports
                <CaretRightIcon size={18} weight="bold" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className={styles.page}>
      <title>Patients | Sweety</title>
      <header className={styles.header}>
        <h1>Your patients</h1>
        <p className={styles.sub}>
          Signed in as {user?.name}. Reports are read-only; patients log their own readings.
        </p>
      </header>
      {body}
    </div>
  );
}
