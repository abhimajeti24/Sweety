import { describe, expect, it } from 'vitest';
import { pageItems } from '../src/components/Pagination/Pagination.jsx';
import { checkDayRules, firstEmptySlot } from '../src/lib/readingRules.js';

const fullDay = ['morning_fasting', 'after_breakfast', 'after_lunch', 'after_dinner'].map(
  (slot, index) => ({ id: index + 1, slot }),
);

describe('checkDayRules (client pre-check)', () => {
  it('reports the daily limit before the duplicate slot, like the server', () => {
    expect(checkDayRules({ slot: 'after_lunch' }, fullDay)).toEqual({
      date: 'You can add only 4 readings per day.',
    });
  });

  it('reports a taken slot', () => {
    expect(checkDayRules({ slot: 'after_lunch' }, fullDay.slice(2, 3))).toEqual({
      slot: 'You already have an After lunch reading for this date.',
    });
  });

  it('lets a reading be saved over itself when editing', () => {
    expect(checkDayRules({ slot: 'after_lunch' }, fullDay, 3)).toEqual({});
  });

  it('finds the first empty slot in meal order', () => {
    expect(firstEmptySlot(fullDay.slice(0, 1))).toBe('after_breakfast');
    expect(firstEmptySlot(fullDay)).toBeNull();
  });
});

describe('pageItems', () => {
  it('shows every page when there are few', () => {
    expect(pageItems(2, 3)).toEqual([1, 2, 3]);
  });

  it('collapses long ranges around the current page', () => {
    expect(pageItems(6, 11)).toEqual([1, null, 5, 6, 7, null, 11]);
    expect(pageItems(1, 11)).toEqual([1, 2, null, 11]);
  });
});
