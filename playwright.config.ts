import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3300);
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
	testDir: "./e2e",
	// Warm every route after the dev server boots but before tests run, so the
	// first wave of requests doesn't race Next's on-demand route compilation.
	globalSetup: process.env.E2E_SKIP_WARMUP
		? undefined
		: "./e2e/global-setup.ts",
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: 1,
	reporter: [["list"], ["html", { open: "never" }]],
	use: {
		baseURL: BASE_URL,
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: {
		command: process.env.E2E_USE_BUILD
			? `next start -p ${PORT}`
			: `next dev -p ${PORT}`,
		url: BASE_URL,
		reuseExistingServer: process.env.E2E_REUSE_SERVER === "1",
		timeout: 180_000,
		env: {
			DISABLE_RATE_LIMIT: "1",
			PAYSTACK_TEST_MODE: "1",
			PAYSTACK_SECRET_KEY: "sk_test_playwright_placeholder",
			NEXT_PUBLIC_APP_URL: BASE_URL,
		},
	},
});
