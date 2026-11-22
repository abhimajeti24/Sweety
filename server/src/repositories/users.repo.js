// SQL for the users table. Maps snake_case columns to camelCase objects; nothing else
// in the server touches users SQL directly.
import { pool } from '../db/pool.js';

const PUBLIC_COLUMNS = 'id, name, email, role';

/** @typedef {{ id: number, name: string, email: string, role: 'patient' | 'doctor' }} PublicUser */

/**
 * Looks a user up by email (case-insensitive), including the password hash for login.
 * @returns {Promise<(PublicUser & { passwordHash: string }) | null>}
 */
export async function findUserWithPasswordByEmail(email, db = pool) {
  const { rows } = await db.query(
    `SELECT ${PUBLIC_COLUMNS}, password_hash FROM users WHERE lower(email) = lower($1)`,
    [email],
  );
  if (rows.length === 0) return null;
  const { password_hash: passwordHash, ...user } = rows[0];
  return { ...user, passwordHash };
}

/** @returns {Promise<PublicUser | null>} */
export async function findUserById(id, db = pool) {
  const { rows } = await db.query(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

/** @returns {Promise<boolean>} */
export async function emailExists(email, db = pool) {
  const { rows } = await db.query('SELECT 1 FROM users WHERE lower(email) = lower($1)', [email]);
  return rows.length > 0;
}

/**
 * @param {{ name: string, email: string, passwordHash: string, role?: 'patient' | 'doctor' }} user
 * @returns {Promise<PublicUser>}
 */
export async function createUser({ name, email, passwordHash, role = 'patient' }, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING ${PUBLIC_COLUMNS}`,
    [name, email, passwordHash, role],
  );
  return rows[0];
}
