// Signs and verifies the session token, and sets or clears the httpOnly cookie that carries it.
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export const SESSION_COOKIE = 'sweety_session';
const ALGORITHM = 'HS256';

/**
 * @param {{ id: number, role: string }} user
 * @returns {string} a signed JWT with the user id as subject
 */
export function signSessionToken(user) {
  return jwt.sign({ role: user.role }, config.jwtSecret, {
    algorithm: ALGORITHM,
    subject: String(user.id),
    expiresIn: config.jwtExpiresIn,
  });
}

/**
 * @param {string} token
 * @returns {{ id: number, role: string } | null} the user from a valid token, or null
 */
export function verifySessionToken(token) {
  try {
    // Pinning the algorithm stops a forged token from choosing a weaker one.
    const payload = jwt.verify(token, config.jwtSecret, { algorithms: [ALGORITHM] });
    const id = Number(payload.sub);
    if (!Number.isInteger(id) || id < 1) return null;
    return { id, role: payload.role };
  } catch {
    return null;
  }
}

function cookieOptions() {
  return {
    httpOnly: true, // JavaScript in the page cannot read it, so an XSS bug cannot steal it.
    sameSite: 'lax', // Not sent on cross-site POSTs, which blocks classic CSRF.
    secure: config.cookieSecure,
    path: '/',
  };
}

/** Logs the user in by setting a cookie that expires together with the token inside it. */
export function setSessionCookie(res, user) {
  const token = signSessionToken(user);
  const { exp } = jwt.decode(token);
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions(), expires: new Date(exp * 1000) });
}

export function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE, cookieOptions());
}
