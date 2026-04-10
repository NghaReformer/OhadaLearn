import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('root redirects to /en or /fr', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL(/\/(en|fr)\/?$/);
    expect(page.url()).toMatch(/\/(en|fr)\/?$/);
  });

  test('renders hero section', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('language toggle navigates to /fr', async ({ page }) => {
    await page.goto('/en');
    const frButton = page.locator('.lang-option:text("FR")');
    await frButton.click();
    await page.waitForURL(/\/fr(\/|$)/);
    expect(page.url()).toMatch(/\/fr\/?/);
  });

  test('waitlist form is visible', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('form')).toBeVisible();
  });

  test('playground cards link to lang-prefixed pages', async ({ page }) => {
    await page.goto('/en');
    const card = page.locator('a[href*="/en/playgrounds/"]').first();
    await expect(card).toBeVisible();
  });

  test('hreflang tags are present', async ({ page }) => {
    await page.goto('/en');
    const enAlt = page.locator('link[hreflang="en"]');
    const frAlt = page.locator('link[hreflang="fr"]');
    await expect(enAlt).toHaveAttribute('href', /\/en(\/|$)/);
    await expect(frAlt).toHaveAttribute('href', /\/fr(\/|$)/);
  });
});
