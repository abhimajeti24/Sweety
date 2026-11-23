// TanStack Query hooks for the doctor pages.
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import * as doctorApi from '../api/doctor.js';

export function usePatients() {
  return useQuery({ queryKey: ['doctor', 'patients'], queryFn: doctorApi.fetchPatients });
}

export function usePatientReports(patientId, date) {
  return useQuery({
    queryKey: ['doctor', 'reports', patientId, date],
    queryFn: () => doctorApi.fetchPatientReports(patientId, date),
    placeholderData: keepPreviousData,
  });
}

export function usePatientSeries(patientId, month) {
  return useQuery({
    queryKey: ['doctor', 'series', patientId, month],
    queryFn: () => doctorApi.fetchPatientSeries(patientId, month),
    placeholderData: keepPreviousData,
  });
}
