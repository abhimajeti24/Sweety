import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { config } from '../src/config.js';
import { pool } from '../src/db/pool.js';
import { app, createUserAndLogin } from './helpers.js';

const newUser = { name: 'Asha Rao', email: 'asha@sweety.test', password: 'correct-horse-battery' };

describe('POST /api/auth/register', () => {
  it('stores a bcrypt hash, never the password, and never returns the hash', async () => {
    const response = await request(app).post('/api/auth/register').send(newUser).expect(201);

    expect(response.body).toEqual({
      user: { id: 1, name: 'Asha Rao', email: 'asha@sweety.test', role: 'patient' },
    });
    expect(JSON.stringify(response.body)).not.toContain('password');
    expect(response.headers['set-cookie'][0]).toMatch(/^sweety_session=.+; .*HttpOnly/);

    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = 1');
    expect(rows[0].password_hash).toMatch(/^\$2[aby]\$/);
    expect(rows[0].password_hash).not.toBe(newUser.password);
  });

  it('rejects an email that already exists, whatever its case', async () => {
    await request(app).post('/api/auth/register').send(newUser).expect(201);
    const response = await request(app)
      .post('/api/auth/register')
      .send({ ...newUser, email: '  ASHA@Sweety.Test ' })
      .expect(409);
    expect(response.body.error).toEqual({
      code: 'EMAIL_TAKEN',
      message: 'An account with this email already exists.',
      fields: { email: 'An account with this email already exists.' },
    });
  });

  it('returns every field error at once', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: '', email: 'nope', password: 'short' })
      .expect(400);
    expect(response.body.error.fields).toEqual({
      name: 'Please enter your name.',
      email: 'Please enter a valid email address.',
      password: 'Password must be 8 to 72 characters.',
    });
  });

  it('always creates a patient, even if the body asks for a doctor', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ ...newUser, role: 'doctor' })
      .expect(201);
    expect(response.body.user.role).toBe('patient');
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with the right password and sets the session cookie', async () => {
    await request(app).post('/api/auth/register').send(newUser).expect(201);
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ASHA@sweety.test', password: newUser.password })
      .expect(200);
    expect(response.body.user.email).toBe('asha@sweety.test');
    expect(response.headers['set-cookie'][0]).toMatch(/^sweety_session=/);
  });

  it('gives the same 401 for a wrong password and for an unknown email', async () => {
    await request(app).post('/api/auth/register').send(newUser).expect(201);

    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: newUser.email, password: 'not-the-password' })
      .expect(401);
    const unknownEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@sweety.test', password: 'whatever-it-is' })
      .expect(401);

    expect(wrongPassword.body).toEqual(unknownEmail.body);
    expect(wrongPassword.body.error.message).toBe('Invalid email or password.');
  });
});

describe('session', () => {
  it('returns the current user from the cookie, and logout clears it', async () => {
    const { agent, user } = await createUserAndLogin();
    const me = await agent.get('/api/auth/me').expect(200);
    expect(me.body.user).toEqual(user);

    await agent.post('/api/auth/logout').expect(204);
    await agent.get('/api/auth/me').expect(401);
  });

  it('rejects a tampered token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Cookie', 'sweety_session=not.a.real.token')
      .expect(401);
    expect(response.body.error.message).toBe('Please log in to continue.');
  });
});

describe('request hygiene', () => {
  it('answers malformed JSON with 400', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email":')
      .expect(400);
    expect(response.body.error.message).toBe('Invalid request body.');
  });

  it('answers a body over 10 kb with 413', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ ...newUser, name: 'x'.repeat(11 * 1024) })
      .expect(413);
  });

  it('refuses form-encoded writes, which a cross-site HTML form could send', async () => {
    await request(app)
      .post('/api/auth/login')
      .type('form')
      .send({ email: newUser.email, password: newUser.password })
      .expect(415);
  });

  it('answers unknown API routes with a JSON 404', async () => {
    const response = await request(app).get('/api/nothing-here').expect(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('reports health, including Redis when it is configured', async () => {
    const response = await request(app).get('/api/health').expect(200);
    const redis = config.redisUrl ? 'ok' : 'disabled';
    expect(response.body).toEqual({ status: 'ok', db: 'ok', redis });
  });
});
