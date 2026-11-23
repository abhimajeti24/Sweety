// The graded rules, end to end in a real browser: every message appears in the form, in the
// brief's words, and add, edit and delete work. Runs at desktop and phone size.
import { expect, test } from '@playwright/test';
import { DEMO, login, reseed, today, tomorrow } from './helpers.js';

test.describe.configure({ mode: 'serial' });
test.beforeEach(() => reseed());

test('every rule message appears in the form, then the day fills up', async ({ page }) => {
  await login(page, DEMO);
  await expect(page.getByRole('heading', { name: '2 of 4 logged' })).toBeVisible();

  await page.getByRole('button', { name: 'Add After lunch reading' }).click();
  const dialog = page.getByRole('dialog');
  const value = dialog.getByLabel('Glucose value');
  const save = dialog.getByRole('button', { name: 'Save reading' });

  await save.click();
  await expect(dialog.getByText('Please enter a glucose value.')).toBeVisible();
  await expect(value).toBeFocused();

  await value.fill('700');
  await save.click();
  await expect(dialog.getByText('Value must be between 40 and 600 mg/dl.')).toBeVisible();

  await value.fill('142');
  await dialog.getByLabel('Time slot').selectOption('after_breakfast');
  await save.click();
  await expect(
    dialog.getByText('You already have an After breakfast reading for this date.'),
  ).toBeVisible();

  await dialog.getByLabel('Time slot').selectOption('after_lunch');
  await dialog.getByLabel('Date').fill(tomorrow());
  await save.click();
  await expect(dialog.getByText('Date cannot be in the future.')).toBeVisible();

  await dialog.getByLabel('Date').fill(today());
  await save.click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('status').filter({ hasText: 'Reading saved.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '3 of 4 logged' })).toBeVisible();

  await page.getByRole('button', { name: 'Add After dinner reading' }).click();
  await value.fill('168');
  await save.click();
  await expect(page.getByRole('heading', { name: 'All 4 logged' })).toBeVisible();

  // A fifth reading: "Add reading" stays available on a full day, so the limit is reachable.
  await page.getByRole('button', { name: 'Add reading', exact: true }).click();
  await dialog.getByLabel('Time slot').selectOption('after_lunch');
  await value.fill('150');
  await save.click();
  await expect(dialog.getByText('You can add only 4 readings per day.')).toBeVisible();
});

test('a duplicate the browser did not know about is caught by the server', async ({ page }) => {
  await login(page, DEMO);
  await page.getByRole('button', { name: 'Add After lunch reading' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Glucose value').fill('140');

  // Another tab adds the same slot after this form loaded the day.
  const response = await page.request.post('/api/readings', {
    data: { date: today(), slot: 'after_lunch', value: 130 },
    headers: { 'X-Timezone': 'Asia/Kolkata' },
  });
  expect(response.status()).toBe(201);

  await dialog.getByRole('button', { name: 'Save reading' }).click();
  await expect(
    dialog.getByText('You already have an After lunch reading for this date.'),
  ).toBeVisible();
  await expect(dialog.getByLabel('Time slot')).toBeFocused();
});

test('edit and delete a reading', async ({ page }) => {
  await login(page, DEMO);

  await page.getByRole('button', { name: 'Edit After breakfast reading' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Edit After breakfast reading' })).toBeVisible();
  await dialog.getByLabel('Glucose value').fill('163');
  await dialog.getByRole('button', { name: 'Save reading' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText('163', { exact: true }).first()).toBeVisible();

  await page.getByRole('button', { name: 'Delete After breakfast reading' }).click();
  await expect(
    dialog.getByText(/^Delete the After breakfast reading for \d{1,2} \w{3} \d{4}\?$/),
  ).toBeVisible();
  await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Reading deleted.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '1 of 4 logged' })).toBeVisible();
});
