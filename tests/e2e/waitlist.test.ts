import { test, expect } from '@playwright/test';

test.describe('Waitlist form', () => {
  test('form has all required fields', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('form submits successfully with valid data', async ({ page }) => {
    // Intercept the waitlist API call to prevent polluting production Supabase.
    // We verify the form submits correctly without inserting real data.
    await page.route('**/api/waitlist', async (route) => {
      const request = route.request();
      const body = JSON.parse(request.postData() || '{}');
      // Verify the request payload is well-formed
      expect(body.name).toBeTruthy();
      expect(body.email).toContain('@');
      expect(body.role).toBeTruthy();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/');
    const form = page.locator('#waitlist form');
    await expect(form).toBeVisible();

    await form.locator('input[type="text"]').first().fill('Test User');
    await form.locator('input[type="email"]').fill(`test-${Date.now()}@example.com`);
    await form.locator('input[type="text"]').nth(1).fill('Test University');
    await form.locator('select').selectOption('student');
    await form.locator('button[type="submit"]').click();

    // Should show success message
    await expect(page.locator('.waitlist-success')).toBeVisible({ timeout: 5000 });
  });
});
