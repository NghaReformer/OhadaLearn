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
		// Wait for the pre-loaded matched pair to appear (Wire payment, not a walkthrough item)
		await expect(page.getByText(/Wire payment/i).first()).toBeVisible({ timeout: 10_000 });
		// Overlay produces <path class="match-line"> per matched pair
		const lines = page.locator('path.match-line');
		await expect(lines.first()).toBeAttached({ timeout: 5_000 });
	});

	test('scenario walkthrough lets you add transactions one by one and balances the scale', async ({ page }) => {
		await page.goto('/en/playgrounds/bank-reconciliation');
		const scenariosTab = page.getByRole('tab', { name: /Scenarios/i });
		await scenariosTab.click();
		await page.getByText(/Simple 2-item reconciliation/i).first().click();

		// Walkthrough panel should be visible with the title and progress 0/2
		await expect(page.getByText(/Walkthrough — missing transactions/i)).toBeVisible({ timeout: 10_000 });
		await expect(page.getByText(/^0 \/ 2$/)).toBeVisible();

		// Initially: bank/ledger panels are EMPTY (the empty-state message is shown)
		// Click first "Add" button (Customer deposit)
		const addButtons = page.locator('button.wt-btn-add');
		await addButtons.first().click();

		// Progress moves to 1/2; the new row appears in the ledger panel
		await expect(page.getByText(/^1 \/ 2$/)).toBeVisible();
		await expect(page.getByText(/Customer deposit/i).first()).toBeVisible();

		// Add the second item (outstanding check)
		await addButtons.first().click();
		await expect(page.getByText(/^2 \/ 2$/)).toBeVisible();
		await expect(page.getByText(/Check #1042 to supplier/i).first()).toBeVisible();

		// Done message appears
		await expect(page.getByText(/All transactions added/i)).toBeVisible();

		// Reset returns the panels to empty walkthrough state
		await page.getByRole('button', { name: /Reset walkthrough/i }).click();
		await expect(page.getByText(/^0 \/ 2$/)).toBeVisible();
	});

	test('transaction journal lets a teacher add a free-form transaction', async ({ page }) => {
		await page.goto('/en/playgrounds/bank-reconciliation');
		// Default playground state — fill the journal form
		await page.getByLabel(/^Description$/i).fill('Bank service fee');
		// The amount field comes from NumberField which renders an input
		const amountInputs = page.getByRole('textbox', { name: /Amount/i });
		await amountInputs.first().fill('2500');
		// Submit (the Outflow direction is default)
		await page.getByRole('button', { name: /Add transaction/i }).click();
		// New row appears in the bank statement panel
		await expect(page.getByText(/Bank service fee/i).first()).toBeVisible({ timeout: 5_000 });
	});
});
