import { describe, expect, it } from 'vitest';
import {
  MAX_READINGS_PER_DAY,
  MESSAGES,
  SLOTS,
  UNIT,
  VALUE_MAX,
  VALUE_MIN,
} from '../src/constants.js';

describe('constants', () => {
  it('defines the four slots from the brief, in meal order', () => {
    expect(SLOTS).toEqual([
      { key: 'morning_fasting', label: 'Morning (fasting)' },
      { key: 'after_breakfast', label: 'After breakfast' },
      { key: 'after_lunch', label: 'After lunch' },
      { key: 'after_dinner', label: 'After dinner' },
    ]);
  });

  it('uses the limits from the brief', () => {
    expect([VALUE_MIN, VALUE_MAX, MAX_READINGS_PER_DAY, UNIT]).toEqual([40, 600, 4, 'mg/dl']);
  });

  it('builds the rule messages with the exact wording of the brief', () => {
    expect(MESSAGES.valueRequired).toBe('Please enter a glucose value.');
    expect(MESSAGES.valueRange).toBe('Value must be between 40 and 600 mg/dl.');
    expect(MESSAGES.dailyLimit).toBe('You can add only 4 readings per day.');
    expect(MESSAGES.futureDate).toBe('Date cannot be in the future.');
  });
});
