// ─────────────────────────────────────────────
// Public transparency pages — smoke test.
// Verifies the landing → transparency → news →
// meetings → tenders → bylaws → councillors →
// wards flow renders without client-side errors.
// ─────────────────────────────────────────────

import { test, expect } from '@playwright/test';

const ROUTES = [
  { path: '/transparency', heading: /Everything the council publishes/i },
  { path: '/news',         heading: /Announcements from the council/i },
  { path: '/meetings',     heading: /Schedules, agendas and minutes/i },
  { path: '/tenders',      heading: /Procurement opportunities/i },
  { path: '/bylaws',       heading: /The rules that govern Bikita/i },
  { path: '/councillors',  heading: /Your elected representatives/i },
  { path: '/wards',        heading: /Bikita by ward/i },
  { path: '/budget',       heading: /Where your rates go/i },
  { path: '/about',        heading: /Bikita Rural District Council/i },
] as const;

test.describe('Public pages smoke', () => {
  for (const { path, heading } of ROUTES) {
    test(`renders ${path}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));

      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toContainText(heading);
      expect(errors).toEqual([]);
    });
  }
});
