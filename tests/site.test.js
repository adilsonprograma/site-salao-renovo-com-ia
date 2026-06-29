import { test, expect } from '@playwright/test';

test('homepage loads without console errors', async ({ page }) => {
  const messages = [];
  page.on('console', msg => messages.push(msg));

  await page.goto('http://localhost:8080');
  await expect(page).toHaveTitle(/Renovo Cabeleireiros/);
  await expect(page.locator('header')).toBeVisible();

  const errors = messages.filter(m => m.type() === 'error');
  expect(errors).toHaveLength(0);
});
