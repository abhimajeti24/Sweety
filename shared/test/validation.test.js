import { describe, expect, it } from 'vitest';
import {
  parseGlucoseValue,
  validateLogin,
  validateReadingInput,
  validateRegister,
} from '../src/validation.js';

const TODAY = '2026-10-15';
const validReading = { date: '2026-10-15', slot: 'after_lunch', value: 142 };

describe('parseGlucoseValue', () => {
  it.each([undefined, null, '', '   '])('treats %j as missing', (raw) => {
    expect(parseGlucoseValue(raw)).toEqual({ ok: false, error: 'Please enter a glucose value.' });
  });

  it.each([39, 601, 120.5, 'abc', -5, '-5', '1e2', '120.5', '12 0', NaN, true, {}])(
    'rejects %j with the range message',
    (raw) => {
      expect(parseGlucoseValue(raw)).toEqual({
        ok: false,
        error: 'Value must be between 40 and 600 mg/dl.',
      });
    },
  );

  it.each([
    [40, 40],
    [600, 600],
    ['0120', 120],
    [' 95 ', 95],
    ['600', 600],
  ])('accepts %j as %i', (raw, expected) => {
    expect(parseGlucoseValue(raw)).toEqual({ ok: true, value: expected });
  });
});

describe('validateReadingInput', () => {
  it('accepts a valid reading and normalises the value to a number', () => {
    const result = validateReadingInput({ ...validReading, value: '0142' }, { today: TODAY });
    expect(result).toEqual({
      ok: true,
      fields: {},
      data: { date: '2026-10-15', slot: 'after_lunch', value: 142 },
    });
  });

  it('rejects a date after today', () => {
    const result = validateReadingInput({ ...validReading, date: '2026-10-16' }, { today: TODAY });
    expect(result.fields).toEqual({ date: 'Date cannot be in the future.' });
  });

  it('accepts today and very old dates', () => {
    expect(validateReadingInput(validReading, { today: TODAY }).ok).toBe(true);
    expect(validateReadingInput({ ...validReading, date: '1990-01-01' }, { today: TODAY }).ok).toBe(
      true,
    );
  });

  it.each(['2026-02-30', '2026-13-01', '15-10-2026', '2026-1-5'])(
    'rejects %s as an invalid date',
    (date) => {
      const result = validateReadingInput({ ...validReading, date }, { today: TODAY });
      expect(result.fields.date).toBe('Please enter a valid date.');
    },
  );

  it('asks for a date when it is missing', () => {
    const result = validateReadingInput({ ...validReading, date: '' }, { today: TODAY });
    expect(result.fields.date).toBe('Please choose a date.');
  });

  it.each([undefined, '', 'bedtime', 'Morning (fasting)'])('rejects slot %j', (slot) => {
    const result = validateReadingInput({ ...validReading, slot }, { today: TODAY });
    expect(result.fields.slot).toBe('Please choose a time slot.');
  });

  it('returns every field error at once', () => {
    const result = validateReadingInput({}, { today: TODAY });
    expect(result.ok).toBe(false);
    expect(result.data).toBeNull();
    expect(result.fields).toEqual({
      date: 'Please choose a date.',
      slot: 'Please choose a time slot.',
      value: 'Please enter a glucose value.',
    });
  });

  it('refuses to run without a valid today, so the future rule is never skipped by accident', () => {
    expect(() => validateReadingInput(validReading, {})).toThrow(TypeError);
  });
});

describe('validateRegister', () => {
  it('trims the name and lower-cases the email', () => {
    const result = validateRegister({
      name: '  Asha Rao ',
      email: '  Asha@Example.COM ',
      password: 'longenough',
    });
    expect(result).toEqual({
      ok: true,
      fields: {},
      data: { name: 'Asha Rao', email: 'asha@example.com', password: 'longenough' },
    });
  });

  it('reports every problem at once', () => {
    const result = validateRegister({ name: '  ', email: 'not-an-email', password: 'short' });
    expect(result.fields).toEqual({
      name: 'Please enter your name.',
      email: 'Please enter a valid email address.',
      password: 'Password must be 8 to 72 characters.',
    });
  });

  it('rejects a name longer than 80 characters', () => {
    const result = validateRegister({
      name: 'a'.repeat(81),
      email: 'a@b.co',
      password: 'longenough',
    });
    expect(result.fields.name).toBe('Name must be 80 characters or fewer.');
  });

  it('measures the password limit in bytes, because bcrypt does', () => {
    // 'é' is two bytes in UTF-8, so 37 of them are 74 bytes even though it is only 37 characters.
    const result = validateRegister({ name: 'A', email: 'a@b.co', password: 'é'.repeat(37) });
    expect(result.fields.password).toBe('Password must be 8 to 72 characters.');
    expect(validateRegister({ name: 'A', email: 'a@b.co', password: 'x'.repeat(72) }).ok).toBe(
      true,
    );
  });
});

describe('validateLogin', () => {
  it('asks for both fields', () => {
    expect(validateLogin({}).fields).toEqual({
      email: 'Please enter a valid email address.',
      password: 'Please enter your password.',
    });
  });

  it('normalises the email', () => {
    expect(validateLogin({ email: ' Demo@Sweety.Test ', password: 'x' }).data).toEqual({
      email: 'demo@sweety.test',
      password: 'x',
    });
  });
});
