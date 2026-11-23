// Keyboard only: log in, add a reading, and get focus back, without touching the mouse.
import { expect, test } from '@playwright/test';
import { DEMO, PASSWORD, reseed } from './helpers.js';

test.beforeEach(() => reseed());

async function tabTo(page, isTarget, maxPresses = 40) {
  for (let presses = 0; presses < maxPresses; presses += 1) {
    if (await isTarget()) return;
    await page.keyboard.press('Tab');
  }
  throw new Error('Could not reach the element with the Tab key');
}

test('log in and add a reading with the keyboard alone', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').waitFor();

  const focusedId = () => page.evaluate(() => document.activeElement?.id);
  await tabTo(page, async () => (await focusedId()) === 'login-email');
  await page.keyboard.type(DEMO);
  await page.keyboard.press('Tab');
  await page.keyboard.type(PASSWORD);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: '2 of 4 logged' })).toBeVisible();

  const addLunch = page.getByRole('button', { name: 'Add After lunch reading' });
  await tabTo(page, () => addLunch.evaluate((button) => button === document.activeElement));
  await page.keyboard.press('Enter');

  const dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel('Glucose value')).toBeFocused();
  await page.keyboard.type('133');
  await page.keyboard.press('Enter');

  await expect(dialog).toBeHidden();
  await expect(page.getByRole('heading', { name: '3 of 4 logged' })).toBeVisible();
});

test('Escape closes a dialog and returns focus to the button that opened it', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(DEMO);
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();

  const editButton = page.getByRole('button', { name: 'Edit After breakfast reading' });
  await editButton.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(editButton).toBeFocused();
});
