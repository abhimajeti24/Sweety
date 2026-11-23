// No page may scroll sideways at common screen widths, from a small phone to a wide desktop.
// (A sidebar layout bug once did between 960 and 1384 px, which the fixed review widths missed.)
import { expect, test } from '@playwright/test';
import { DEMO, login } from './helpers.js';

const WIDTHS = [360, 390, 768, 1024, 1280, 1366, 1920];
const PAGES = ['/', '/history', '/reports?date=2026-10-15'];

test('no horizontal scrolling at any common width', async ({ page }) => {
  await login(page, DEMO);
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 800 });
    for (const path of PAGES) {
      await page.goto(path);
      await page.locator('main').getByRole('heading', { level: 1 }).waitFor();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${path} at ${width}px scrolls sideways by ${overflow}px`).toBe(0);
    }
  }
});

// Report cards side by side must start their stats at the same height. (At 1280 px the
// Month-to-date score line once wrapped under its tab on that card only.)
test('report card headers line up across each row of cards', async ({ page }) => {
  await login(page, DEMO);
  await page.goto('/reports?date=2026-10-15');
  await page.getByRole('article').nth(2).waitFor();
  for (const width of [...WIDTHS, 960, 1100]) {
    await page.setViewportSize({ width, height: 800 });
    const rows = await page.evaluate(() => {
      const byTop = {};
      for (const card of document.querySelectorAll('article')) {
        const header = card.querySelector('header').getBoundingClientRect();
        const top = Math.round(card.getBoundingClientRect().top);
        (byTop[top] ??= []).push(Math.round(header.height));
      }
      return Object.values(byTop);
    });
    for (const heights of rows) {
      expect(new Set(heights).size, `headers at ${width}px: ${heights.join(', ')}`).toBe(1);
    }
  }
});
