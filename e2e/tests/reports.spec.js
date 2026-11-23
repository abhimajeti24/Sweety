// Reports and History in the browser: the brief's example ranges, one-decimal averages, empty
// states, the chart and its table view, pagination and the month filter.
import { expect, test } from '@playwright/test';
import { DEMO, login } from './helpers.js';

test.beforeEach(async ({ page }) => {
  await login(page, DEMO);
});

test("shows the brief's example: 15 Oct 2026", async ({ page }) => {
  await page.goto('/reports?date=2026-10-15');
  const card = (title) =>
    page.getByRole('article').filter({ has: page.getByRole('heading', { name: title }) });

  await expect(card('Daily')).toContainText('15 Oct 2026');
  await expect(card('Month-to-date')).toContainText('1 Oct to 15 Oct 2026');
  await expect(card('Monthly')).toContainText('1 Sep to 30 Sep 2026');
  await expect(card('Monthly')).toContainText('0 of 120 logged');
  await expect(card('Monthly')).toContainText('No readings between 1 Sep and 30 Sep 2026.');

  // Average always with one decimal; the daily card lists its readings with their slots.
  await expect(card('Month-to-date').getByText(/^\d+\.\d$/)).toBeVisible();
  await expect(card('Daily').getByText('Morning (fasting)')).toBeVisible();
});

test('shows a friendly empty state for a day with nothing logged', async ({ page }) => {
  await page.goto('/reports?date=2026-09-20');
  await expect(
    page.getByText(
      'Nothing logged on 20 Sep 2026 yet. Add your Morning (fasting) reading to start the day.',
    ),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add reading' })).toBeVisible();
});

test('draws the month chart with a legend that focuses a slot and a table view', async ({
  page,
}) => {
  await page.goto('/reports?date=2026-10-15');
  await expect(page.getByRole('figure', { name: /readings in October 2026/ })).toBeVisible();

  const lunch = page.getByRole('button', { name: 'After lunch' });
  await lunch.click();
  await expect(lunch).toHaveAttribute('aria-pressed', 'true');

  await page.getByText('Show the readings as a table').click();
  const table = page.getByRole('table');
  await expect(table.getByRole('columnheader', { name: 'After dinner' })).toBeVisible();
  expect(await table.getByRole('row').count()).toBeGreaterThan(10);
});

test('pages through History and filters by month', async ({ page }) => {
  await page.goto('/history');
  await expect(page.getByText(/Page 1 of \d+, \d+ readings/)).toBeVisible();

  await page.getByRole('button', { name: 'Page 2' }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByText(/Page 2 of \d+/)).toBeVisible();

  await page.getByLabel('Month').selectOption({ label: 'October 2026' });
  await expect(page).toHaveURL(/month=2026-10/);
  await expect(page.getByText(/^\d{1,2} Oct to \d{1,2} Oct 2026$/)).toBeVisible();
});
