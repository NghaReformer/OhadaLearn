import { test, expect } from '@playwright/test';

test.describe('Waitlist form', () => {
  test('form has all required fields', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
