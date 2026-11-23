// Doctor endpoints (read-only).
import { apiRequest } from './client.js';

export function fetchPatients() {
  return apiRequest('/doctor/patients');
}

export function fetchPatientReports(patientId, date) {
  return apiRequest(`/doctor/patients/${patientId}/reports?date=${encodeURIComponent(date)}`);
}

export function fetchPatientSeries(patientId, month) {
  return apiRequest(`/doctor/patients/${patientId}/series?month=${encodeURIComponent(month)}`);
}
