// Small helpers that keep the tests short: a logged-in client and a quick way to add readings.
import request from 'supertest';
import { createApp } from '../src/app.js';
import { pool } from '../src/db/pool.js';

export const app = createApp();
export const TIME_ZONE = 'Asia/Kolkata';

let userCount = 0;

/**
 * Registers a fresh user and returns a Supertest agent that keeps the session cookie.
 * @param {{ name?: string, email?: string, password?: string }} [overrides]
 */
export async function createUserAndLogin(overrides = {}) {
  userCount += 1;
  const credentials = {
    name: `Test User ${userCount}`,
    email: `user${userCount}@sweety.test`,
    password: 'correct-horse-battery',
    ...overrides,
  };
  const agent = request.agent(app);
  const response = await agent.post('/api/auth/register').send(credentials).expect(201);
  return { agent, user: response.body.user, credentials };
}

/** Adds a reading through the API (so every rule runs) and returns the response. */
export function addReading(agent, reading) {
  return agent.post('/api/readings').set('X-Timezone', TIME_ZONE).send(reading);
}

/**
 * Creates a doctor. Public registration only makes patients, so the role is set in SQL
 * (like the seed does) and the doctor then logs in to get a token carrying that role.
 */
export async function createDoctorAndLogin() {
  const { credentials, user } = await createUserAndLogin({ name: 'Dr. Test' });
  await pool.query("UPDATE users SET role = 'doctor' WHERE id = $1", [user.id]);
  const agent = request.agent(app);
  await agent.post('/api/auth/login').send(credentials).expect(200);
  return { agent, user: { ...user, role: 'doctor' } };
}

export function assignPatient(doctorId, patientId) {
  return pool.query('INSERT INTO doctor_patients (doctor_id, patient_id) VALUES ($1, $2)', [
    doctorId,
    patientId,
  ]);
}
