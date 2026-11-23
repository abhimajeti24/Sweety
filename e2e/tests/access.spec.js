// Who can see what: guests, patients and doctors, and isolation between patients.
import { expect, test } from '@playwright/test';
import { DEMO, DOCTOR, PASSWORD, RAVI, login } from './helpers.js';

test('a guest is sent to the login page', async ({ page }) => {
  await page.goto('/reports');
  await expect(page).toHaveURL(/\/login$/);
});

test('register, log out and log back in', async ({ page }) => {
  const email = `e2e-${Date.now()}@sweety.test`;
  await page.goto('/register');
  await page.getByLabel('Name').fill('Kavya Iyer');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('heading', { name: 'Today', level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: '0 of 4 logged' })).toBeVisible();

  await page.getByRole('button', { name: 'Log out' }).first().click();
  await expect(page).toHaveURL(/\/login$/);
  await login(page, email);
});

test('wrong password shows the generic message', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(DEMO);
  await page.getByLabel('Password', { exact: true }).fill('not-the-password');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByRole('alert')).toContainText('Invalid email or password.');
});

test("one patient cannot reach another patient's reading", async ({ page }) => {
  await login(page, DEMO);
  const list = await page.request.get('/api/readings?limit=1');
  const [reading] = (await list.json()).data;

  await page.getByRole('button', { name: 'Log out' }).first().click();
  await login(page, RAVI);
  const response = await page.request.get(`/api/readings/${reading.id}`);
  expect(response.status()).toBe(404);
});

test('a doctor sees assigned patients read-only and cannot use patient pages', async ({ page }) => {
  await login(page, DOCTOR);
  await expect(page.getByRole('link', { name: /Demo Patient/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Ravi Kumar/ })).toHaveCount(0);

  await page.getByRole('link', { name: /Demo Patient/ }).click();
  await expect(page.getByRole('heading', { name: 'Demo Patient', level: 1 })).toBeVisible();
  await expect(page.getByRole('article').first()).toBeVisible();
  await expect(page.getByRole('button', { name: /^(Add|Edit|Delete)\b/ })).toHaveCount(0);

  await page.goto('/');
  await expect(page).toHaveURL(/\/doctor$/);
});

test('a patient is kept out of the doctor pages', async ({ page }) => {
  await login(page, DEMO);
  await page.goto('/doctor');
  await expect(page).toHaveURL(/\/$/);
});
