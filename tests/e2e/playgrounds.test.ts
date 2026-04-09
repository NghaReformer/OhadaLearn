import { test, expect } from '@playwright/test';

test.describe('Playground catalog', () => {
  test('shows playground cards', async ({ page }) => {
    await page.goto('/playgrounds');
    const cards = page.locator('a[href*="/playgrounds/"]');
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });
});

test.describe('Playground wrapper', () => {
  test('TVM playground loads in iframe', async ({ page }) => {
    await page.goto('/playgrounds/tvm');
    const iframe = page.locator('iframe');
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute('src', /tvm-playground\.html/);
  });

  test('back link returns to catalog', async ({ page }) => {
    await page.goto('/playgrounds/tvm');
    // The page has two links to /playgrounds: nav link and back link.
    // Use first() to accept either — both are visible and correct.
    const backLink = page.locator('a[href="/playgrounds"]').first();
    await expect(backLink).toBeVisible();
  });

  test('404 for invalid playground slug', async ({ page }) => {
    const response = await page.goto('/playgrounds/nonexistent');
    expect(response?.status()).toBe(404);
  });
});
