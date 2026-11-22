// /api/reports: the three report cards for a date, and the month series for the chart.
// Mounted behind requireAuth and requireRole('patient') in app.js.
import { Router } from 'express';
import * as reportsService from '../services/reports.service.js';

export const reportsRoutes = Router();

reportsRoutes.get('/', async (req, res) => {
  res.json(await reportsService.getReports(req.user.id, req.query, req.today));
});

reportsRoutes.get('/series', async (req, res) => {
  res.json(await reportsService.getMonthSeries(req.user.id, req.query, req.today));
});
