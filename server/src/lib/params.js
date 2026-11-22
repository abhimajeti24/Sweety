// Parsing helpers for URL parameters and query strings.

// Ids are Postgres INTEGER columns, so anything larger cannot exist.
const MAX_INTEGER_ID = 2_147_483_647;

/**
 * Turns a route id like '12' into a number. Returns null for anything that is not a
 * positive whole number, which callers answer with 404 (an id that cannot exist is "not found").
 */
export function parseId(raw) {
  if (typeof raw !== 'string' || !/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return id >= 1 && id <= MAX_INTEGER_ID ? id : null;
}

/** Reads an optional whole-number query value. Returns `fallback` when absent, NaN when malformed. */
export function parseOptionalInteger(raw, fallback) {
  if (raw === undefined || raw === '') return fallback;
  return typeof raw === 'string' && /^\d+$/.test(raw) ? Number(raw) : NaN;
}
