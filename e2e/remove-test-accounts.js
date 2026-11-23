// Deletes the throwaway accounts the browser tests register (emails starting with "e2e-").
// Their readings go with them through ON DELETE CASCADE.
import { pool } from '../server/src/db/pool.js';

await pool.query("DELETE FROM users WHERE email LIKE 'e2e-%@sweety.test'");
await pool.end();
