// Auth endpoints.
import { apiRequest } from './client.js';

/** The logged-in user, or null when there is no valid session. */
export async function fetchCurrentUser() {
  try {
    const { user } = await apiRequest('/auth/me');
    return user;
  } catch (error) {
    if (error.status === 401) return null;
    throw error;
  }
}

export async function login(credentials) {
  const { user } = await apiRequest('/auth/login', { method: 'POST', body: credentials });
  return user;
}

export async function register(details) {
  const { user } = await apiRequest('/auth/register', { method: 'POST', body: details });
  return user;
}

export function logout() {
  return apiRequest('/auth/logout', { method: 'POST' });
}
