// Readings endpoints.
import { apiRequest } from './client.js';

/**
 * @param {{ date?: string, from?: string, to?: string, page?: number, limit?: number }} params
 * @returns {Promise<{ data: object[], pagination: { page: number, limit: number, total: number, totalPages: number } }>}
 */
export function listReadings(params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
  }
  const search = query.toString();
  return apiRequest(`/readings${search ? `?${search}` : ''}`);
}

export async function createReading(reading) {
  const { reading: created } = await apiRequest('/readings', { method: 'POST', body: reading });
  return created;
}

export async function updateReading(id, reading) {
  const { reading: updated } = await apiRequest(`/readings/${id}`, {
    method: 'PUT',
    body: reading,
  });
  return updated;
}

export function deleteReading(id) {
  return apiRequest(`/readings/${id}`, { method: 'DELETE' });
}
