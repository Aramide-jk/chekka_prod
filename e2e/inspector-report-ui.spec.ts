import {
	type APIRequestContext,
	type BrowserContext,
	expect,
	test,
} from "@playwright/test";

const PASSWORD = process.env.SEED_DEFAULT_PASSWORD ?? "password123";
const BUYER_EMAIL = "buyer@test.local";
const INSPECTOR_EMAIL = "inspector@test.local";

async function loginOrSkip(
	ctx: BrowserContext | APIRequestContext,
	email: string,
) {
	const req: APIRequestContext = "request" in ctx ? ctx.request : ctx;
	const res = await req.post("/api/auth/login", {
		data: { email, password: PASSWORD },
	});
	if (res.status() !== 200) {
		test.skip(
			true,
			`Seed user ${email} missing — run \`yarn seed\` first.`,
		);
	}
	return res;
}

async function userId(req: APIRequestContext): Promise<string> {
	const body = await req.get("/api/users/me").then((r) => r.json());
	const id: string | undefined =
		body?.data?.user?._id ?? body?.data?.user?.id;
	expect(id, "user id").toBeTruthy();
	return id as string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Inspector report UI: drives /inspector/inspections/[id]/report. The headline
// rule under test — every "minor" or "serious" checklist item MUST carry a
// comment, enforced client-side before the report can be locked.
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Inspector report submission UI", () => {
	test.describe.configure({ timeout: 180_000 });
	test("a serious item without a comment is blocked, then submits once the comment is added", async ({
		browser,
	}) => {
		const buyerCtx = await browser.newContext();
		const inspectorCtx = await browser.newContext();
		try {
			await loginOrSkip(buyerCtx, BUYER_EMAIL);
			await loginOrSkip(inspectorCtx, INSPECTOR_EMAIL);
			const inspectorId = await userId(inspectorCtx.request);

			// Buyer books with the inspector pre-assigned; inspector starts it.
			const created = await buyerCtx.request.post("/api/inspections", {
				data: {
					inspectionType: "premium",
					car: {
						make: "ReportUI",
						model: "Spec",
						year: 2022,
						sellerType: "private",
						city: "Lagos",
						address: "Report UI address",
					},
					assignedInspectorId: inspectorId,
					scheduledFor: new Date(Date.now() + 432_000_000).toISOString(),
					slot: "16:00",
				},
			});
			const inspectionId: string = (await created.json()).data?.inspection
				?._id;
			expect(inspectionId).toBeTruthy();

			await inspectorCtx.request.patch(`/api/inspections/${inspectionId}`, {
				data: { acceptedAt: new Date().toISOString(), status: "scheduled" },
			});
			await inspectorCtx.request.patch(`/api/inspections/${inspectionId}`, {
				data: { sellerContactedAt: new Date().toISOString() },
			});
			await inspectorCtx.request.patch(
				`/api/inspections/${inspectionId}`,
				{
					data: {
						startedAt: new Date().toISOString(),
						status: "in_progress",
					},
				},
			);
			for (let i = 0; i < 30; i++) {
				const upload = await inspectorCtx.request.post(
					`/api/inspections/${inspectionId}/photos`,
					{
						multipart: {
							section: "exterior",
							photo: {
								name: `report-prerequisite-${i}.jpg`,
								mimeType: "image/jpeg",
								buffer: Buffer.from([0xff, 0xd8, 0xff, i]),
							},
						},
					},
				);
				expect(upload.ok(), `prerequisite photo ${i}`).toBeTruthy();
			}
			const physicalComplete = await inspectorCtx.request.patch(
				`/api/inspections/${inspectionId}`,
				{
					data: {
						completedPhysicalAt: new Date().toISOString(),
						status: "report_processing",
					},
				},
			);
			expect(physicalComplete.ok(), "physical inspection completes").toBeTruthy();

			const page = await inspectorCtx.newPage();
			await page.goto(`/inspector/inspections/${inspectionId}/report`);
			await expect(page.getByTestId("report-tabs")).toBeVisible({
				timeout: 10_000,
			});

			// The report renders one section at a time; the default tab is
			// "Vehicle Details", so switch to Exterior before its items appear.
			await page
				.getByTestId("report-tabs")
				.getByText("Exterior", { exact: true })
				.click();
			// Mark the first Exterior item "serious" — its comment box appears.
			const exterior = page.getByTestId("report-section-Exterior");
			await expect(exterior).toBeVisible();
			await exterior
				.locator("button", { hasText: /^serious$/ })
				.first()
				.click();
			// The per-item comment textarea is revealed but left empty on purpose.
			await expect(exterior.locator("textarea").first()).toBeVisible();

			// Fill the buyer summary on the Verdict tab and try to submit.
			await page.getByTestId("report-tabs").getByText("Verdict").click();
			await page
				.locator('textarea[placeholder*="summarising"]')
				.fill("Mechanically sound but one serious electrical fault.");
			await page
				.getByRole("button", { name: /Submit & lock report/i })
				.click();

			// Validation jumps back to Exterior and shows the comment error.
			await expect(
				page.getByTestId("report-section-Exterior"),
			).toBeVisible({ timeout: 10_000 });
			await expect(page.locator("body")).toContainText(
				/every minor or serious item needs one/i,
			);

			// The report must NOT be locked yet.
			const midway = await inspectorCtx.request
				.get(`/api/inspections/${inspectionId}`)
				.then((r) => r.json());
			expect(midway.data?.inspection?.status).not.toBe("completed");
			expect(midway.data?.inspection?.reportLockedAt).toBeFalsy();

			// Add the required comment, then submit successfully.
			await page
				.getByTestId("report-section-Exterior")
				.locator("textarea")
				.first()
				.fill("Alternator intermittently fails to charge under load.");
			await page.getByTestId("report-tabs").getByText("Verdict").click();
			await page
				.getByRole("button", { name: /Submit & lock report/i })
				.click();

			// Redirects to the buyer-facing detail page on success.
			await page.waitForURL(new RegExp(`/inspections/${inspectionId}$`), {
				timeout: 15_000,
			});

			// Server reflects a locked, completed report carrying the comment.
			const final = await inspectorCtx.request
				.get(`/api/inspections/${inspectionId}`)
				.then((r) => r.json());
			const finalIns = final.data?.inspection;
			expect(finalIns?.status).toBe("completed");
			expect(finalIns?.reportLockedAt).toBeTruthy();
			const seriousItem = (finalIns?.report?.exterior ?? []).find(
				(i: { status: string }) => i.status === "serious",
			);
			expect(seriousItem?.comment).toContain("Alternator");

			await page.close();
		} finally {
			await buyerCtx.close();
			await inspectorCtx.close();
		}
	});
});
