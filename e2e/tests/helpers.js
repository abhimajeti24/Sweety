// Shared helpers for the browser tests: demo accounts, dates in the app's timezone, logging in,
// resetting the demo data, and an accessibility scan.
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const PASSWORD = 'SweetyDemo#2026';
export const DEMO = 'demo@sweety.test';
export const RAVI = 'ravi@sweety.test';
export const DOCTOR = 'doctor@sweety.test';

function isoInIndia(date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(date);
}

export const today = () => isoInIndia(new Date());
export const tomorrow = () => isoInIndia(new Date(Date.now() + 24 * 60 * 60 * 1000));

/** Recreates the demo accounts and readings (the seed is idempotent). */
export function reseed({ migrate = false } = {}) {
  const command = migrate ? 'npm run db:migrate && npm run db:seed' : 'npm run db:seed';
  execSync(command, { cwd: ROOT, stdio: 'ignore' });
}

/** Logs in through the form and waits for the role's home page. */
export async function login(page, email) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(email === DOCTOR ? /\/doctor$/ : /\/$/);
}

/** WCAG 2.2 A and AA rules; the page must have no violations at all. */
export async function expectNoAxeViolations(page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const summary = results.violations.map(
    (violation) => `${violation.id} (${violation.impact}): ${violation.nodes.length} node(s)`,
  );
  expect(summary).toEqual([]);
}
