import { test, expect } from '@playwright/test';

test.describe('Waitlist form', () => {
  test('form has all required fields', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('form submits successfully with valid data', async ({ page }) => {
    await page.route('**/api/waitlist', async (route) => {
      const request = route.request();
      const body = JSON.parse(request.postData() || '{}');
      expect(body.name).toBeTruthy();
      expect(body.email).toContain('@');
      expect(body.role).toBeTruthy();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/en/');
    const form = page.locator('#waitlist form');
    await expect(form).toBeVisible();

    await form.locator('input[type="text"]').first().fill('Test User');
    await form.locator('input[type="email"]').fill(`test-${Date.now()}@example.com`);
    await form.locator('input[type="text"]').nth(1).fill('Test University');
    await form.locator('select').selectOption('student');
    await form.locator('button[type="submit"]').click();

    await expect(page.locator('.success-msg')).toBeVisible({ timeout: 5000 });
  });
});
