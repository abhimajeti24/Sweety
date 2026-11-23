// Client-side copy of the two database rules, run against the readings already loaded for a date,
// so the form can show the message before a round trip. The server still checks both.
import { MAX_READINGS_PER_DAY, MESSAGES, SLOTS, duplicateSlotMessage } from '@sweety/shared';

/**
 * Same order as the server: the daily limit first, then the slot.
 * @param {{ slot: string }} reading the reading about to be saved
 * @param {Array<{ id: number, slot: string }>} dayReadings readings already stored on that date
 * @param {number | null} [editingId] the reading being edited, which does not count against itself
 * @returns {Record<string, string>} field errors, empty when both rules pass
 */
export function checkDayRules({ slot }, dayReadings, editingId = null) {
  const others = dayReadings.filter((reading) => reading.id !== editingId);
  if (others.length >= MAX_READINGS_PER_DAY) return { date: MESSAGES.dailyLimit };
  if (others.some((reading) => reading.slot === slot)) return { slot: duplicateSlotMessage(slot) };
  return {};
}

/** The first slot, in meal order, with no reading yet; null when the day is full. */
export function firstEmptySlot(dayReadings) {
  const taken = new Set(dayReadings.map((reading) => reading.slot));
  return SLOTS.find((slot) => !taken.has(slot.key))?.key ?? null;
}
