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
