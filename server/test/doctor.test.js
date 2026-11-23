import { describe, expect, it } from 'vitest';
import { addReading, assignPatient, createDoctorAndLogin, createUserAndLogin } from './helpers.js';

describe('doctor role', () => {
  it('lists only the patients assigned to the doctor', async () => {
    const doctor = await createDoctorAndLogin();
    const assigned = await createUserAndLogin({ name: 'Assigned Patient' });
    await createUserAndLogin({ name: 'Someone Else' });
    await assignPatient(doctor.user.id, assigned.user.id);

    const response = await doctor.agent.get('/api/doctor/patients').expect(200);
    expect(response.body).toEqual([
      { id: assigned.user.id, name: 'Assigned Patient', email: assigned.user.email },
    ]);
  });

  it('reads an assigned patient reports in the same shape as /api/reports', async () => {
    const doctor = await createDoctorAndLogin();
    const patient = await createUserAndLogin();
    await assignPatient(doctor.user.id, patient.user.id);
    await addReading(patient.agent, { date: '2026-10-15', slot: 'after_lunch', value: 150 });

    const viaDoctor = await doctor.agent
      .get(`/api/doctor/patients/${patient.user.id}/reports?date=2026-10-15`)
      .expect(200);
    const viaPatient = await patient.agent.get('/api/reports?date=2026-10-15').expect(200);
    expect(viaDoctor.body).toEqual(viaPatient.body);
    expect(viaDoctor.body.daily.stats.count).toBe(1);

    const series = await doctor.agent
      .get(`/api/doctor/patients/${patient.user.id}/series?month=2026-10`)
      .expect(200);
    expect(series.body).toHaveLength(1);
  });

  it('answers 404 for a patient who is not assigned, or does not exist', async () => {
    const doctor = await createDoctorAndLogin();
    const stranger = await createUserAndLogin();
    const response = await doctor.agent
      .get(`/api/doctor/patients/${stranger.user.id}/reports`)
      .expect(404);
    expect(response.body.error.message).toBe('Patient not found.');
    await doctor.agent.get('/api/doctor/patients/99999/reports').expect(404);
    await doctor.agent.get('/api/doctor/patients/abc/reports').expect(404);
  });

  it('keeps patients out of doctor routes and doctors out of patient routes', async () => {
    const patient = await createUserAndLogin();
    const doctor = await createDoctorAndLogin();
    await patient.agent.get('/api/doctor/patients').expect(403);
    await doctor.agent.get('/api/readings').expect(403);
    await doctor.agent
      .post('/api/readings')
      .send({ date: '2026-10-15', slot: 'after_lunch', value: 120 })
      .expect(403);
  });
});
