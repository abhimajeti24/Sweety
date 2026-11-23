// Accessibility scans with axe (WCAG 2.2 A and AA) on every page and state, at desktop and phone
// size. Any violation fails the test.
import { expect, test } from '@playwright/test';
import { DEMO, DOCTOR, expectNoAxeViolations, login } from './helpers.js';

test('login and register, including field errors', async ({ page }) => {
  await page.goto('/login');
  await expectNoAxeViolations(page);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
  await expectNoAxeViolations(page);

  await page.goto('/register');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByText('Please enter your name.')).toBeVisible();
  await expectNoAxeViolations(page);
});

test('patient pages, the reading dialog with errors, and the 404 page', async ({ page }) => {
  await login(page, DEMO);
  await expectNoAxeViolations(page);

  await page.getByRole('button', { name: 'Add After lunch reading' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Save reading' }).click();
  await expect(page.getByText('Please enter a glucose value.')).toBeVisible();
  await expectNoAxeViolations(page);
  await page.keyboard.press('Escape');

  await page.goto('/history');
  await expect(page.getByText(/Page 1 of/)).toBeVisible();
  await expectNoAxeViolations(page);

  await page.goto('/reports?date=2026-10-15');
  await page.getByText('Show the readings as a table').click();
  await expectNoAxeViolations(page);

  await page.goto('/no-such-page');
  await expect(page.getByRole('heading', { name: 'We could not find that page' })).toBeVisible();
  await expectNoAxeViolations(page);
});

test('doctor pages', async ({ page }) => {
  await login(page, DOCTOR);
  await expectNoAxeViolations(page);
  await page.getByRole('link', { name: /Demo Patient/ }).click();
  await expect(page.getByRole('heading', { name: 'Demo Patient', level: 1 })).toBeVisible();
  await expectNoAxeViolations(page);
});
