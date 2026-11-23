// A recorded walkthrough of every requirement, with captions on screen.
// Run with `npm run demo:record`; the video lands in e2e/results/<test>/video.webm.
// It is not part of `npm run test:e2e`.
import { expect, test } from '@playwright/test';
import { DEMO, DOCTOR, PASSWORD, reseed, today, tomorrow } from './helpers.js';

const READ = 2600;
// Stretches every caption hold so the walkthrough runs about two and a half minutes.
const PACE = 1.6;

async function caption(page, text, hold = READ) {
  await page.evaluate((message) => {
    let bar = document.getElementById('demo-caption');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'demo-caption';
      bar.setAttribute('aria-hidden', 'true');
      Object.assign(bar.style, {
        position: 'fixed',
        left: '50%',
        bottom: '24px',
        transform: 'translateX(-50%)',
        maxWidth: '900px',
        padding: '12px 20px',
        borderRadius: '12px',
        background: 'rgba(27, 16, 38, 0.92)',
        color: '#fff',
        font: '600 18px/1.4 "Funnel Sans Variable", system-ui, sans-serif',
        textAlign: 'center',
        zIndex: '2147483647',
        pointerEvents: 'none',
      });
      document.body.appendChild(bar);
    }
    bar.textContent = message;
  }, text);
  await page.waitForTimeout(hold * PACE);
}

async function typeInto(locator, text) {
  await locator.click();
  await locator.fill('');
  await locator.pressSequentially(text, { delay: 45 });
}

async function logIn(page, email) {
  await page.goto('/login');
  await typeInto(page.getByLabel('Email'), email);
  await typeInto(page.getByLabel('Password', { exact: true }), PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(email === DOCTOR ? /\/doctor$/ : /\/$/);
}

async function logOut(page) {
  await page.getByRole('button', { name: 'Log out' }).first().click();
  await expect(page).toHaveURL(/\/login$/);
}

test.beforeAll(() => reseed());
test.afterAll(() => reseed());

test('Sweety walkthrough', async ({ page }) => {
  test.setTimeout(6 * 60 * 1000);

  await page.goto('/login');
  await caption(
    page,
    'Sweety: log up to four blood glucose readings a day. Node.js, Express, PostgreSQL and React.',
    4000,
  );

  // 0:10 register, log out, log in
  await page.getByRole('link', { name: 'Create an account' }).click();
  await caption(
    page,
    'Register with name, email and password. Passwords are stored as bcrypt hashes.',
  );
  const email = `e2e-demo-${Date.now()}@sweety.test`;
  await typeInto(page.getByLabel('Name'), 'Kavya Iyer');
  await typeInto(page.getByLabel('Email'), email);
  await typeInto(page.getByLabel('Password', { exact: true }), PASSWORD);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/$/);
  await caption(page, 'A new account lands on Today, with nothing logged yet.');
  await logOut(page);
  await logIn(page, email);
  await caption(page, 'Logged back in. The session lives in an httpOnly cookie.', 2000);
  await logOut(page);

  // 0:30 demo patient
  await logIn(page, DEMO);
  await caption(
    page,
    'The demo patient: 2 of 4 readings logged today, one tile per meal slot.',
    3500,
  );

  // 0:40 three validation messages
  await page.getByRole('button', { name: 'Add After lunch reading' }).click();
  const dialog = page.getByRole('dialog');
  const value = dialog.getByLabel('Glucose value');
  const save = dialog.getByRole('button', { name: 'Save reading' });
  await caption(page, 'Saving an empty value...', 1500);
  await save.click();
  await caption(page, '"Please enter a glucose value."');
  await typeInto(value, '700');
  await save.click();
  await caption(page, '700 is outside 40 to 600: "Value must be between 40 and 600 mg/dl."');
  await typeInto(value, '142');
  await dialog.getByLabel('Date').fill(tomorrow());
  await save.click();
  await caption(page, 'Tomorrow, in the user\'s own timezone: "Date cannot be in the future."');

  // 1:00 add After lunch, duplicate, add After dinner
  await dialog.getByLabel('Date').fill(today());
  await save.click();
  await caption(page, 'After lunch saved: 3 of 4 logged.');
  await page.getByRole('button', { name: 'Add reading', exact: true }).click();
  await dialog.getByLabel('Time slot').selectOption('after_lunch');
  await typeInto(value, '150');
  await save.click();
  await caption(
    page,
    'After lunch again: "You already have an After lunch reading for this date."',
  );
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('button', { name: 'Add After dinner reading' }).click();
  await typeInto(value, '168');
  await save.click();
  await caption(page, 'After dinner saved: all 4 slots are logged.');

  // 1:15 fifth reading, edit, delete
  await page.getByRole('button', { name: 'Add reading', exact: true }).click();
  await typeInto(value, '120');
  await save.click();
  await caption(page, 'A fifth reading: "You can add only 4 readings per day."');
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('button', { name: 'Edit After dinner reading' }).click();
  await typeInto(value, '172');
  await caption(page, 'Editing a reading runs the same rules.', 1500);
  await save.click();
  await page.getByRole('button', { name: 'Delete After dinner reading' }).click();
  await caption(page, 'Deleting asks first.', 1500);
  await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
  await caption(page, 'Back to 3 of 4.', 1500);

  // 1:35 reports
  await page.getByRole('link', { name: 'Reports', exact: true }).click();
  await page.goto('/reports?date=2026-10-15');
  await page.getByRole('figure').waitFor();
  await caption(
    page,
    "The brief's example, 15 Oct 2026: Daily, Month-to-date (1 Oct to 15 Oct) and Monthly (1 Sep to 30 Sep).",
    4000,
  );
  await caption(
    page,
    'Highest, lowest, a one-decimal average and the count. September has no data, so it says so.',
    3500,
  );
  await page.getByRole('figure').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'After lunch' }).click();
  await caption(
    page,
    'The month chart: one line per slot, each with its own marker. Focus one slot.',
    3000,
  );
  await page.getByRole('button', { name: 'After lunch' }).click();
  await page.goto('/reports?date=2026-09-20');
  await caption(page, 'A date with no readings gets a friendly empty state.', 2600);

  // 2:05 history
  await page.getByRole('link', { name: 'History', exact: true }).click();
  await page.getByText(/Page 1 of/).waitFor();
  await caption(page, "History: every reading, 20 per page, with the whole day's score.", 2400);
  await page.getByRole('button', { name: 'Page 2' }).click();
  await caption(page, 'Page 2.', 1500);

  // 2:15 doctor
  await logOut(page);
  await logIn(page, DOCTOR);
  await caption(page, 'Doctor role: only the patients assigned to this doctor.', 2400);
  await page.getByRole('link', { name: /Demo Patient/ }).click();
  await page.getByRole('figure').waitFor();
  await caption(page, 'Read-only reports for the patient. No add, edit or delete.', 3000);

  // 2:30 close
  await caption(
    page,
    'Backed by 180 automated tests and 25 browser tests, run in CI against PostgreSQL and Redis.',
    4000,
  );
});
