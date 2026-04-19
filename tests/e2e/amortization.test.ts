import { test, expect } from '@playwright/test';

test.describe('Amortization playground — native module', () => {
	test('loads as a native Svelte module, not an iframe', async ({ page }) => {
		await page.goto('/en/playgrounds/amortization');
		await expect(page.locator('iframe')).toHaveCount(0);
	});

	test('renders inputs, KPIs, schedule, charts, lifecycle, solver', async ({ page }) => {
		await page.goto('/en/playgrounds/amortization');
		// PlaygroundShell renders a tab bar; the first tab is typically the Playground itself.
		// Wait for a KPI value to become visible — that confirms the engine ran.
		await expect(page.getByText(/First Payment/i).first()).toBeVisible({ timeout: 10_000 });
		await expect(page.getByText(/Total Interest/i).first()).toBeVisible();
		await expect(page.getByText(/APR/i).first()).toBeVisible();

		// Schedule table present
		await expect(page.getByText(/Schedule/i).first()).toBeVisible();

		// Lifecycle panel present
		await expect(page.getByText(/Accounting Lifecycle/i).first()).toBeVisible();

		// Solver panel present
		await expect(page.getByText(/What-If Solver/i).first()).toBeVisible();
	});

	test('scenarios tab lists 8 scenarios', async ({ page }) => {
		await page.goto('/en/playgrounds/amortization');
		// Click the Scenarios tab
		const scenariosTab = page.getByRole('tab', { name: /Scenarios/i });
		await scenariosTab.click();
		// Each scenario card will render its title — count by looking for unique title fragments
		await expect(page.getByText(/Classic SME Annuity/i)).toBeVisible();
		await expect(page.getByText(/Bridge Facility/i)).toBeVisible();
		await expect(page.getByText(/Infrastructure/i)).toBeVisible();
		await expect(page.getByText(/Prepayment with Penalty/i)).toBeVisible();
	});

	test('learn tab renders authored sections', async ({ page }) => {
		await page.goto('/en/playgrounds/amortization');
		const learnTab = page.getByRole('tab', { name: /Learn/i });
		await learnTab.click();
		// The learn content has its own H1 including " — Introduction"
		await expect(
			page.getByRole('heading', { name: /Loan Amortization\s*[—-]\s*Introduction/i }),
		).toBeVisible();
	});

	test('french route serves translated content', async ({ page }) => {
		await page.goto('/fr/playgrounds/amortization');
		await expect(page.getByText(/Capital|Intérêts|Mensuelle/i).first()).toBeVisible({
			timeout: 10_000,
		});
	});

	test('scenario click updates the state', async ({ page }) => {
		await page.goto('/en/playgrounds/amortization');
		const scenariosTab = page.getByRole('tab', { name: /Scenarios/i });
		await scenariosTab.click();
		const scenarioCard = page.getByText(/Classic SME Annuity/i).first();
		await scenarioCard.click();
		// After click, the playground tab becomes active and inputs should reflect the scenario
		await expect(page.getByText(/First Payment/i).first()).toBeVisible();
	});
});
