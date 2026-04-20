import { test, expect } from '@playwright/test';

test.describe('Bank Reconciliation playground — native module', () => {
	test('loads as a native Svelte module, not an iframe', async ({ page }) => {
		await page.goto('/en/playgrounds/bank-reconciliation');
		await expect(page.locator('iframe')).toHaveCount(0);
	});

	test('renders inputs, KPIs, statement, adjustments', async ({ page }) => {
		await page.goto('/en/playgrounds/bank-reconciliation');
		await expect(page.getByText(/Period & Balances/i).first()).toBeVisible({ timeout: 10_000 });
		await expect(page.getByText(/Matched items/i).first()).toBeVisible();
		await expect(page.getByText(/Reconciliation Statement/i).first()).toBeVisible();
		await expect(page.getByText(/Adjusting Journal Entries/i).first()).toBeVisible();
	});

	test('scenarios tab lists the seeded scenarios', async ({ page }) => {
		await page.goto('/en/playgrounds/bank-reconciliation');
		const scenariosTab = page.getByRole('tab', { name: /Scenarios/i });
		await scenariosTab.click();
		await expect(page.getByText(/Simple 2-item reconciliation/i)).toBeVisible();
		await expect(page.getByText(/Classic 5-item reconciliation/i)).toBeVisible();
		await expect(page.getByText(/NSF & direct debit/i)).toBeVisible();
	});

	test('learn tab renders authored introduction', async ({ page }) => {
		await page.goto('/en/playgrounds/bank-reconciliation');
		const learnTab = page.getByRole('tab', { name: /Learn/i });
		await learnTab.click();
		await expect(
			page.getByRole('heading', { name: /Bank Reconciliation\s*[—-]\s*Introduction/i }),
		).toBeVisible();
	});

	test('french route serves translated content', async ({ page }) => {
		await page.goto('/fr/playgrounds/bank-reconciliation');
		await expect(page.getByText(/Période|Solde|Rapprochement/i).first()).toBeVisible({
			timeout: 10_000,
		});
	});

	test('selecting "Classic 5-item" scenario populates the workspace', async ({ page }) => {
		await page.goto('/en/playgrounds/bank-reconciliation');
		const scenariosTab = page.getByRole('tab', { name: /Scenarios/i });
		await scenariosTab.click();
		await page.getByText(/Classic 5-item reconciliation/i).first().click();
		// After selection, the playground tab is active and the bank-statement panel shows entries
		await expect(page.getByText(/Frais de tenue de compte/i).first()).toBeVisible({ timeout: 10_000 });
	});
});
