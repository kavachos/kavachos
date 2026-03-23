import { expect, test } from "@playwright/test";

// ─── Login page (unauthenticated) ─────────────────────────────────────────────

test.describe("login screen", () => {
	test.beforeEach(async ({ page }) => {
		// Clear any stored session so we always land on login
		await page.context().clearCookies();
		await page.goto("/");
		await page.evaluate(() => sessionStorage.removeItem("kavachos_dashboard_secret"));
		await page.reload();
	});

	test("shows KavachOS branding", async ({ page }) => {
		await expect(page.locator("h1", { hasText: "KavachOS" })).toBeVisible();
		await expect(page.locator("text=Admin Dashboard")).toBeVisible();
	});

	test("shows secret input and submit button", async ({ page }) => {
		await expect(page.locator("#kavachos-secret")).toBeVisible();
		await expect(page.locator('button[type="submit"]')).toBeVisible();
		await expect(page.locator('button[type="submit"]')).toHaveText("Access dashboard");
	});

	test("submit button is disabled when secret is empty", async ({ page }) => {
		await expect(page.locator('button[type="submit"]')).toBeDisabled();
	});

	test("submit button enables when secret is typed", async ({ page }) => {
		await page.fill("#kavachos-secret", "some-secret");
		await expect(page.locator('button[type="submit"]')).toBeEnabled();
	});

	test("shows toggle to reveal secret", async ({ page }) => {
		const input = page.locator("#kavachos-secret");
		await expect(input).toHaveAttribute("type", "password");

		await page.click('button[aria-label="Show secret"]');
		await expect(input).toHaveAttribute("type", "text");

		await page.click('button[aria-label="Hide secret"]');
		await expect(input).toHaveAttribute("type", "password");
	});

	test("shows error on invalid secret", async ({ page }) => {
		await page.fill("#kavachos-secret", "wrong-secret");
		await page.click('button[type="submit"]');

		// Error appears once the request resolves - either API error or network error
		await expect(page.locator("text=/Invalid secret|Could not reach the API/")).toBeVisible({
			timeout: 10_000,
		});
	});
});

// ─── Authenticated shell ───────────────────────────────────────────────────────

test.describe("authenticated dashboard", () => {
	test.beforeEach(async ({ page }) => {
		// Inject a session token and mock the auth endpoint so the gate passes
		await page.route("**/api/dashboard/auth", (route) => route.fulfill({ status: 200 }));
		await page.route("**/api/dashboard/**", (route) =>
			route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) }),
		);

		await page.goto("/");
		await page.evaluate(() => sessionStorage.setItem("kavachos_dashboard_secret", "test-secret"));
		await page.reload();
	});

	test("shows sidebar with KavachOS logo", async ({ page }) => {
		await expect(page.locator("aside")).toBeVisible();
		await expect(page.locator("aside", { hasText: "KavachOS" })).toBeVisible();
	});

	test("sidebar has all main nav items", async ({ page }) => {
		const nav = page.locator("aside nav");
		await expect(nav.locator("button", { hasText: "Overview" })).toBeVisible();
		await expect(nav.locator("button", { hasText: "Agents" })).toBeVisible();
		await expect(nav.locator("button", { hasText: "Users" })).toBeVisible();
		await expect(nav.locator("button", { hasText: "Permissions" })).toBeVisible();
		await expect(nav.locator("button", { hasText: "Delegations" })).toBeVisible();
		await expect(nav.locator("button", { hasText: "MCP Servers" })).toBeVisible();
		await expect(nav.locator("button", { hasText: "Audit Log" })).toBeVisible();
		await expect(nav.locator("button", { hasText: "Security" })).toBeVisible();
		await expect(nav.locator("button", { hasText: "Settings" })).toBeVisible();
	});

	test("sidebar shows system online indicator", async ({ page }) => {
		await expect(page.locator("aside", { hasText: "System Online" })).toBeVisible();
	});

	test("header has theme toggle and sign out button", async ({ page }) => {
		await expect(page.locator('button[aria-label*="mode"]')).toBeVisible();
		await expect(page.locator("button", { hasText: "Sign out" })).toBeVisible();
	});

	test("overview is the default active page", async ({ page }) => {
		const overviewBtn = page.locator("aside nav button", { hasText: "Overview" });
		await expect(overviewBtn).toHaveClass(/bg-zinc/);
	});

	test("navigates to agents page", async ({ page }) => {
		await page.click('aside nav button:has-text("Agents")');
		const agentsBtn = page.locator("aside nav button", { hasText: "Agents" });
		await expect(agentsBtn).toHaveClass(/bg-zinc/);
	});

	test("navigates to audit log page", async ({ page }) => {
		await page.click('aside nav button:has-text("Audit Log")');
		const auditBtn = page.locator("aside nav button", { hasText: "Audit Log" });
		await expect(auditBtn).toHaveClass(/bg-zinc/);
	});

	test("navigates to settings page", async ({ page }) => {
		await page.click('aside nav button:has-text("Settings")');
		const settingsBtn = page.locator("aside nav button", { hasText: "Settings" });
		await expect(settingsBtn).toHaveClass(/bg-zinc/);
	});

	test("sign out returns to login screen", async ({ page }) => {
		await page.click('button:has-text("Sign out")');
		await expect(page.locator("#kavachos-secret")).toBeVisible();
	});

	test("theme toggle switches between light and dark", async ({ page }) => {
		const html = page.locator("html");
		// Start in dark (default)
		await expect(html).toHaveClass(/dark/);

		const toggleBtn = page.locator('button[aria-label*="mode"]');
		await toggleBtn.click();
		await expect(html).not.toHaveClass(/dark/);

		await toggleBtn.click();
		await expect(html).toHaveClass(/dark/);
	});
});
