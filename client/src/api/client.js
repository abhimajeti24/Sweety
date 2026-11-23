// The one place the app talks to the API: sends the session cookie and the browser timezone,
// and turns every failure into an ApiError with status, code, message and per-field messages.
import { ERROR_CODES, MESSAGES } from '@sweety/shared';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export class ApiError extends Error {
  constructor({ status, code, message, fields }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields ?? null;
  }
}

/** The browser's IANA timezone, which the server uses to decide what "today" is. */
export function browserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

let handleUnauthorized = null;

/** AuthContext registers a callback here so an expired session logs the user out everywhere. */
export function setUnauthorizedHandler(callback) {
  handleUnauthorized = callback;
}

function networkError() {
  return new ApiError({ status: 0, code: ERROR_CODES.network, message: MESSAGES.network });
}

/**
 * @param {string} path for example '/readings?date=2026-10-15'
 * @param {{ method?: string, body?: unknown, signal?: AbortSignal }} [options]
 * @returns {Promise<any>} the parsed JSON body, or null for 204 No Content
 */
export async function apiRequest(path, { method = 'GET', body, signal } = {}) {
  const headers = { 'X-Timezone': browserTimeZone() };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'include',
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw networkError();
  }

  if (response.status === 204) return null;
  const payload = await response.json().catch(() => null);
  if (response.ok) return payload;

  const details = payload?.error;
  // Our API always answers errors with JSON. A 5xx without it came from a proxy: the server is down.
  if (!details && response.status >= 500) throw networkError();

  if (response.status === 401 && !path.startsWith('/auth/')) handleUnauthorized?.();
  throw new ApiError({
    status: response.status,
    code: details?.code ?? ERROR_CODES.internal,
    message: details?.message ?? MESSAGES.serverError,
    fields: details?.fields,
  });
}
