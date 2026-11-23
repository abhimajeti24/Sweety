import { describe, expect, it } from 'vitest';
import { runReminders } from '../src/jobs/reminder.worker.js';
import { addReading, assignPatient, createDoctorAndLogin, createUserAndLogin } from './helpers.js';

const DAY = '2026-10-15';

describe('runReminders', () => {
  it('lists patients with fewer than four readings and the slots they are missing', async () => {
    const partial = await createUserAndLogin();
    const complete = await createUserAndLogin();
    const none = await createUserAndLogin();
    const doctor = await createDoctorAndLogin();
    await assignPatient(doctor.user.id, partial.user.id);

    await addReading(partial.agent, { date: DAY, slot: 'morning_fasting', value: 100 });
    await addReading(partial.agent, { date: DAY, slot: 'after_breakfast', value: 140 });
    for (const slot of ['morning_fasting', 'after_breakfast', 'after_lunch', 'after_dinner']) {
      await addReading(complete.agent, { date: DAY, slot, value: 120 });
    }

    const reminders = await runReminders({ today: DAY });
    expect(reminders).toEqual([
      { userId: partial.user.id, logged: 2, missing: ['after_lunch', 'after_dinner'] },
      {
        userId: none.user.id,
        logged: 0,
        missing: ['morning_fasting', 'after_breakfast', 'after_lunch', 'after_dinner'],
      },
    ]);
  });
});
