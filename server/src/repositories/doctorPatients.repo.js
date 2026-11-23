// SQL for doctor-patient assignments.
import { pool } from '../db/pool.js';

/** The patients assigned to a doctor, by name. @returns {Promise<Array<{ id: number, name: string, email: string }>>} */
export async function listPatientsForDoctor(doctorId, db = pool) {
  const { rows } = await db.query(
    `SELECT u.id, u.name, u.email
     FROM doctor_patients dp
     JOIN users u ON u.id = dp.patient_id
     WHERE dp.doctor_id = $1 AND u.role = 'patient'
     ORDER BY u.name, u.id`,
    [doctorId],
  );
  return rows;
}

/** The assigned patient, or null when this doctor may not see them. */
export async function findAssignedPatient({ doctorId, patientId }, db = pool) {
  const { rows } = await db.query(
    `SELECT u.id, u.name, u.email
     FROM doctor_patients dp
     JOIN users u ON u.id = dp.patient_id
     WHERE dp.doctor_id = $1 AND dp.patient_id = $2 AND u.role = 'patient'`,
    [doctorId, patientId],
  );
  return rows[0] ?? null;
}

export async function assignPatient({ doctorId, patientId }, db = pool) {
  await db.query(
    `INSERT INTO doctor_patients (doctor_id, patient_id) VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [doctorId, patientId],
  );
}
