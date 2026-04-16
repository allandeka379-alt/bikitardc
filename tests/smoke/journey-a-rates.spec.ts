// ─────────────────────────────────────────────
// Journey A — Resident pays rates (spec §7.1).
//
// Uses the dev-toolbar force-outcome override
// (Ctrl+Shift+D → "succeeded") to keep the test
// deterministic, avoiding the 90/10 success/fail
// randomness of the processing page.
// ─────────────────────────────────────────────

import { test, expect } from '@playwright/test';

test.describe('Journey A — Resident pays rates', () => {
  test('landing → login → property → pay → success → dashboard shows zero balance', async ({ page }) => {
    // Landing
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Log in using the demo credential card
    await page.getByRole('link', { name: 'Log in', exact: true }).first().click();
    await expect(page).toHaveURL(/\/login/);
    await page.getByRole('button', { name: /Resident/ }).first().click();
    await page.getByRole('button', { name: /Log in/ }).click();

    // Dashboard
    await expect(page).toHaveURL(/\/portal\/dashboard/);
    await expect(page.getByRole('heading', { name: /at a glance/i })).toBeVisible();

    // Stand 4521 should show the $87.50 amber balance
    const standCard = page.getByText('Stand 4521').first();
    await expect(standCard).toBeVisible();

    // Force payment to succeed via dev toolbar
    await page.keyboard.press('Control+Shift+KeyD');
    await page.getByRole('button', { name: /succeeded/i }).click();
    await page.keyboard.press('Escape');

    // Click Pay now on the Stand 4521 card. There are two property cards — the
    // overdue one (tier=overdue) is the Journey-A property.
    await page
      .getByRole('link', { name: /pay now/i })
      .first()
      .click();

    // Method picker — amount should be pre-filled to 87.50, EcoCash selected
    await expect(page).toHaveURL(/\/portal\/pay\/p_4521/);
    const amount = page.getByLabel(/Amount/);
    await expect(amount).toHaveValue('87.50');

    // Submit payment
    await page.getByRole('button', { name: /Pay \$87/ }).click();

    // Processing page → success redirect
    await expect(page).toHaveURL(/\/portal\/pay\/processing/);
    await expect(page.getByRole('heading', { name: /processing/i })).toBeVisible();
    await expect(page).toHaveURL(/\/portal\/pay\/success/, { timeout: 20_000 });
    await expect(page.getByRole('heading', { name: /Payment successful/i })).toBeVisible();

    // Back to dashboard — balance should now be $0 on Stand 4521
    await page.getByRole('link', { name: /back to dashboard/i }).click();
    await expect(page).toHaveURL(/\/portal\/dashboard/);
    await expect(page.getByText(/Paid up/i).first()).toBeVisible();
  });
});
