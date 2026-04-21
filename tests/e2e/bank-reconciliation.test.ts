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

	test('renders the variance scale, donut, and flow visuals', async ({ page }) => {
		await page.goto('/en/playgrounds/bank-reconciliation');
		// Variance scale renders an SVG with both pan labels (Bank, Books)
		const scaleSvg = page.locator('svg').filter({ hasText: 'Bank' }).filter({ hasText: 'Books' }).first();
		await expect(scaleSvg).toBeVisible({ timeout: 10_000 });
		// Status pill on the scale shows Reconciled by default (empty inputs)
		await expect(page.getByText(/^Reconciled$/).first()).toBeVisible();
		// Donut and flow titles are present
		await expect(page.getByText(/Items by category/i).first()).toBeVisible();
		await expect(page.getByText(/How balances reconcile/i).first()).toBeVisible();
	});

	test('matching pairs overlay renders SVG curves when matches exist', async ({ page }) => {
		await page.goto('/en/playgrounds/bank-reconciliation');
		const scenariosTab = page.getByRole('tab', { name: /Scenarios/i });
		await scenariosTab.click();
		await page.getByText(/Classic 5-item reconciliation/i).first().click();
		// Wait for state to load
		await expect(page.getByText(/Frais de tenue de compte/i).first()).toBeVisible({ timeout: 10_000 });
		// Overlay produces <path class="match-line"> per matched pair (the classic scenario has 1 reference match)
		const lines = page.locator('path.match-line');
		await expect(lines.first()).toBeAttached({ timeout: 5_000 });
	});
});
