// Read-only access for doctors: their patient list and each assigned patient's reports.
// A patient who is not assigned answers 404, the same as one who does not exist.
import { MESSAGES } from '@sweety/shared';
import { AppError } from '../lib/AppError.js';
import { parseId } from '../lib/params.js';
import * as doctorPatientsRepo from '../repositories/doctorPatients.repo.js';
import * as reportsService from './reports.service.js';

export function listPatients(doctorId) {
  return doctorPatientsRepo.listPatientsForDoctor(doctorId);
}

async function assignedPatientIdOrThrow(doctorId, rawPatientId) {
  const patientId = parseId(rawPatientId);
  const patient =
    patientId === null
      ? null
      : await doctorPatientsRepo.findAssignedPatient({ doctorId, patientId });
  if (!patient) throw AppError.notFound(MESSAGES.patientNotFound);
  return patient.id;
}

/** Same payload as GET /api/reports, for an assigned patient. */
export async function getPatientReports(doctorId, rawPatientId, query, today) {
  const patientId = await assignedPatientIdOrThrow(doctorId, rawPatientId);
  return reportsService.getReports(patientId, query, today);
}

/** Same payload as GET /api/reports/series, for an assigned patient. */
export async function getPatientSeries(doctorId, rawPatientId, query, today) {
  const patientId = await assignedPatientIdOrThrow(doctorId, rawPatientId);
  return reportsService.getMonthSeries(patientId, query, today);
}
