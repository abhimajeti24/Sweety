import { describe, expect, it } from 'vitest';
import {
  duplicateSlotMessage,
  formatAverage,
  formatDisplayDate,
  formatMonthLabel,
  formatRange,
  slotLabel,
  withArticle,
} from '../src/format.js';

describe('withArticle', () => {
  it.each([
    ['Morning (fasting)', 'a Morning (fasting)'],
    ['After breakfast', 'an After breakfast'],
    ['After lunch', 'an After lunch'],
    ['After dinner', 'an After dinner'],
  ])('%s', (label, expected) => {
    expect(withArticle(label)).toBe(expected);
  });
});

describe('duplicateSlotMessage', () => {
  it('matches the wording of the brief', () => {
    expect(duplicateSlotMessage('after_lunch')).toBe(
      'You already have an After lunch reading for this date.',
    );
    expect(duplicateSlotMessage('morning_fasting')).toBe(
      'You already have a Morning (fasting) reading for this date.',
    );
  });
});

describe('date formatting', () => {
  it('formats one date', () => {
    expect(formatDisplayDate('2026-10-15')).toBe('15 Oct 2026');
  });

  it('writes the year once for a range inside one year', () => {
    expect(formatRange('2026-10-01', '2026-10-15')).toBe('1 Oct to 15 Oct 2026');
  });

  it('writes both years when the range crosses a year', () => {
    expect(formatRange('2026-12-01', '2027-01-31')).toBe('1 Dec 2026 to 31 Jan 2027');
  });

  it('can join with "and" for sentences', () => {
    expect(formatRange('2026-09-01', '2026-09-30', 'and')).toBe('1 Sep and 30 Sep 2026');
  });

  it('names a month', () => {
    expect(formatMonthLabel('2026-10')).toBe('October 2026');
  });
});

describe('other formatting', () => {
  it('shows averages with one decimal', () => {
    expect(formatAverage(120)).toBe('120.0');
    expect(formatAverage(100.7)).toBe('100.7');
    expect(formatAverage(null)).toBeNull();
  });

  it('labels slots', () => {
    expect(slotLabel('after_breakfast')).toBe('After breakfast');
  });
});
