import { expect, test } from "@playwright/test";

const BUYER_EMAIL = "buyer@test.local";
const PASSWORD = process.env.SEED_DEFAULT_PASSWORD ?? "password123";

test.describe("Auth + buyer dashboard end-to-end", () => {
	test("session probe returns 401 when not signed in", async ({
		request,
	}) => {
		const res = await request.get("/api/auth/session");
		expect(res.status()).toBe(401);
	});

	test("login page renders recruiter demo access panel and 1-click instant login", async ({
		page,
		request,
	}) => {
		const seedCheck = await request.post("/api/auth/login", {
			data: { email: BUYER_EMAIL, password: PASSWORD },
		});
		if (seedCheck.status() !== 200) {
			test.skip(true, "Seeded buyer not present — run `npm run seed` first.");
			return;
		}

		await page.goto("/login");
		const demoPanel = page.getByTestId("demo-access-panel");
		await expect(demoPanel).toBeVisible();

		// Click 1-click Buyer demo button
		const buyerBtn = demoPanel.getByRole("button", { name: /buyer/i });
		await expect(buyerBtn).toBeVisible();
		await buyerBtn.click();

		// Should auto-authenticate and land directly on buyer dashboard
		await page.waitForURL(/\/dashboard$/, { timeout: 15_000 });
		await expect(page.getByTestId("dashboard-stats")).toBeVisible();
	});

	test("floating demo role switcher is visible and can open role options", async ({
		page,
	}) => {
		await page.goto("/");
		const switcher = page.getByTestId("demo-role-switcher");
		await expect(switcher).toBeVisible();

		// Open switcher panel
		await switcher.getByRole("button", { name: /toggle demo role switcher/i }).click();
		await expect(page.getByText("Recruiter Demo Access")).toBeVisible();
		await expect(page.getByRole("button", { name: /buyer/i }).first()).toBeVisible();
		await expect(page.getByRole("button", { name: /admin/i })).toBeVisible();
		await expect(page.getByRole("button", { name: /inspector/i })).toBeVisible();
	});

	test("buyer can sign in and land on a populated dashboard", async ({
		page,
		request,
	}) => {
		// confirm credentials exist via direct API
		const login = await request.post("/api/auth/login", {
			data: { email: BUYER_EMAIL, password: PASSWORD },
		});
		if (login.status() !== 200) {
			test.skip(
				true,
				"Seeded buyer not present — run `npm run seed` first.",
			);
			return;
		}

		await page.goto("/login");
		await page
			.getByTestId("login-form")
			.getByLabel("Email")
			.fill(BUYER_EMAIL);
		await page
			.getByTestId("login-form")
			.getByLabel("Password")
			.fill(PASSWORD);
		await page.getByRole("button", { name: /sign in/i }).click();

		await page.waitForURL(/\/dashboard$/, { timeout: 15_000 });
		await expect(page.getByTestId("dashboard-stats")).toBeVisible();
		// Seed inserts at least one active inspection
		await expect(
			page
				.getByTestId("dashboard-stats")
				.locator("text=/^\\d+$/")
				.first(),
		).toBeVisible();
	});

	test("buyer can fetch their inspection list via API", async ({
		request,
	}) => {
		const login = await request.post("/api/auth/login", {
			data: { email: BUYER_EMAIL, password: PASSWORD },
		});
		if (login.status() !== 200) {
			test.skip(true, "Seeded buyer not present.");
			return;
		}
		const list = await request.get("/api/inspections");
		expect(list.ok()).toBeTruthy();
		const body = await list.json();
		expect(Array.isArray(body.data?.inspections)).toBe(true);
	});
});
