// /api/doctor: a doctor's patients and their reports. Mounted behind requireAuth and
// requireRole('doctor') in app.js. There are no write routes: doctors are read-only.
import { Router } from 'express';
import * as doctorService from '../services/doctor.service.js';

export const doctorRoutes = Router();

doctorRoutes.get('/patients', async (req, res) => {
  res.json(await doctorService.listPatients(req.user.id));
});

doctorRoutes.get('/patients/:patientId/reports', async (req, res) => {
  res.json(
    await doctorService.getPatientReports(req.user.id, req.params.patientId, req.query, req.today),
  );
});

doctorRoutes.get('/patients/:patientId/series', async (req, res) => {
  res.json(
    await doctorService.getPatientSeries(req.user.id, req.params.patientId, req.query, req.today),
  );
});
