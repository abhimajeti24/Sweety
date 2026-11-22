import { describe, expect, it, vi } from 'vitest';
import { errorHandler } from '../src/middleware/errorHandler.js';

function run(error) {
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
  errorHandler(error, { log: { error: vi.fn() } }, res, () => {});
  return { status: res.status.mock.calls[0][0], body: res.json.mock.calls[0][0] };
}

describe('errorHandler', () => {
  it('maps a unique violation on readings_one_per_slot to DUPLICATE_SLOT with the slot name', () => {
    const { status, body } = run({
      code: '23505',
      constraint: 'readings_one_per_slot',
      detail: 'Key (user_id, reading_date, slot)=(1, 2026-10-15, after_lunch) already exists.',
    });
    expect(status).toBe(409);
    expect(body.error).toEqual({
      code: 'DUPLICATE_SLOT',
      message: 'You already have an After lunch reading for this date.',
      fields: { slot: 'You already have an After lunch reading for this date.' },
    });
  });

  it('hides unexpected errors behind a generic 500', () => {
    const { status, body } = run(new Error('connection string with a password in it'));
    expect(status).toBe(500);
    expect(body).toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' },
    });
  });
});
