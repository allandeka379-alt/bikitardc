// ─────────────────────────────────────────────
// Journey D — Staff processes a service request
// (spec §7.4). Logs in as the rates clerk, opens
// the requests map, selects a request via the
// list view fallback (avoiding Leaflet-click
// flake), and assigns a team.
// ─────────────────────────────────────────────

import { test, expect } from '@playwright/test';

test.describe('Journey D — Staff service request', () => {
  test('clerk → requests list → assign team → audit log updated', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /Rates Clerk/ }).first().click();
    await page.getByRole('button', { name: /Log in/ }).click();
    await expect(page).toHaveURL(/\/erp\/dashboard/);

    // Navigate to the requests list
    await page.goto('/erp/requests');
    await expect(page.getByRole('heading', { name: 'Service requests' })).toBeVisible();

    // Open the first request's side panel by clicking its row
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Panel visible
    await expect(page.getByRole('dialog')).toBeVisible();

    // Assign to the Water & Sanitation team
    await page.getByRole('button', { name: 'Water & Sanitation' }).click();
    await expect(page.getByText(/Assigned/)).toBeVisible();

    // Close panel and open audit drawer
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: /Audit/ }).click();
    await expect(page.getByRole('dialog', { name: /audit log/i })).toBeVisible();
    await expect(page.getByText(/Water & Sanitation/i).first()).toBeVisible();
  });
});
