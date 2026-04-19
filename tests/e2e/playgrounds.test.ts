import { test, expect } from '@playwright/test';

test.describe('Playground catalog', () => {
  test('shows playground cards', async ({ page }) => {
    await page.goto('/en/playgrounds');
    const cards = page.locator('a[href*="/en/playgrounds/"]');
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });
});

test.describe('Playground wrapper', () => {
  test('Depreciation playground still loads in iframe (not yet migrated)', async ({ page }) => {
    await page.goto('/en/playgrounds/depreciation');
    const iframe = page.locator('iframe');
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute('src', /depreciation-playground\.html/);
  });

  test('back link returns to catalog', async ({ page }) => {
    await page.goto('/en/playgrounds/depreciation');
    const backLink = page.locator('a[href*="/playgrounds"]').first();
    await expect(backLink).toBeVisible();
  });

  test('404 for invalid playground slug', async ({ page }) => {
    const response = await page.goto('/en/playgrounds/nonexistent');
    expect(response?.status()).toBe(404);
  });

  test('legacy URL redirects to /en/', async ({ page }) => {
    await page.goto('/playgrounds/tvm');
    await page.waitForURL(/\/en\/playgrounds\/tvm/);
    expect(page.url()).toContain('/en/playgrounds/tvm');
  });
});
