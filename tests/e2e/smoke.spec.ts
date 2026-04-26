import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Smoke tests for the marketing + parent route chrome. Doesn't touch
// the /alice scene route — that needs A-Frame + WebXR and warrants
// its own measurement protocol per plan 05.

test.describe("home page", () => {
  test("renders with expected title and headline", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Wanderlearn Stories/);
    await expect(
      page.getByRole("heading", { level: 1, name: /Step inside a story/i }),
    ).toBeVisible();
  });

  test("passes axe-core a11y check (no violations)", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("placeholder pages", () => {
  for (const path of ["/about", "/library", "/dashboard", "/account", "/safety", "/privacy", "/terms"]) {
    test(`${path} renders and passes axe`, async ({ page }) => {
      await page.goto(path);
      // Each placeholder uses EmptyState — the title text is rendered as a
      // CardTitle <div> (shadcn's pattern), not a heading element. We check
      // for the rendered text instead of a specific role.
      await expect(
        page.getByText(/coming soon|under counsel review/i).first(),
      ).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

test.describe("not-found", () => {
  test("/some-bogus-path returns the 404 page", async ({ page }) => {
    const response = await page.goto("/some-bogus-path");
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { level: 1, name: /We can.t find that page/i }),
    ).toBeVisible();
  });
});
