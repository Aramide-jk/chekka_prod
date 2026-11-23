import { type APIRequestContext, expect, test } from "@playwright/test";

const PASSWORD = process.env.SEED_DEFAULT_PASSWORD ?? "password123";

async function login(
	request: APIRequestContext,
	email: string,
) {
	const response = await request.post("/api/auth/login", {
		data: { email, password: PASSWORD },
	});
	if (!response.ok()) test.skip(true, `Seed user ${email} is unavailable.`);
}

async function userId(request: APIRequestContext): Promise<string> {
	const response = await request.get("/api/users/me");
	const body = await response.json();
	expect(response.ok(), JSON.stringify(body)).toBeTruthy();
	return body.data.user._id ?? body.data.user.id;
}

function booking(inspectorId: string, scheduledFor: string, slot: string) {
	return {
		inspectionType: "standard",
		car: {
			make: "Lifecycle",
			model: "Integrity",
			year: 2025,
			sellerType: "private",
			city: "Lagos",
			address: "1 Workflow Test Road",
			sellerContact: "+2348010000000",
		},
		assignedInspectorId: inspectorId,
		scheduledFor,
		slot,
	};
}

test.describe("inspection lifecycle integrity", () => {
	test("server enforces authorization, ordering, and workflow prerequisites", async ({
		browser,
	}) => {
		const buyer = await browser.newContext();
		const inspector = await browser.newContext();
		try {
			await login(buyer.request, "buyer@test.local");
			await login(inspector.request, "inspector@test.local");
			const inspectorId = await userId(inspector.request);
			const scheduledFor = new Date(Date.now() + 604_800_000).toISOString();
			const created = await buyer.request.post("/api/inspections", {
				data: booking(inspectorId, scheduledFor, "08:00"),
			});
			expect(created.status()).toBe(201);
			const id = (await created.json()).data.inspection._id as string;

			const buyerMutation = await buyer.request.patch(`/api/inspections/${id}`, {
				data: { status: "completed", completedAt: new Date().toISOString() },
			});
			expect(buyerMutation.status()).toBe(403);

			const skippedAccept = await inspector.request.patch(
				`/api/inspections/${id}`,
				{ data: { status: "in_progress", startedAt: new Date().toISOString() } },
			);
			expect(skippedAccept.status()).toBe(400);

			const missingAcceptance = await inspector.request.patch(
				`/api/inspections/${id}`,
				{ data: { status: "scheduled" } },
			);
			expect(missingAcceptance.status()).toBe(400);

			const accepted = await inspector.request.patch(`/api/inspections/${id}`, {
				data: { status: "scheduled", acceptedAt: new Date().toISOString() },
			});
			expect(accepted.ok()).toBeTruthy();

			const beforeContact = await inspector.request.patch(
				`/api/inspections/${id}`,
				{ data: { status: "in_progress", startedAt: new Date().toISOString() } },
			);
			expect(beforeContact.status()).toBe(400);

			const contacted = await inspector.request.patch(`/api/inspections/${id}`, {
				data: { sellerContactedAt: new Date().toISOString() },
			});
			expect(contacted.ok()).toBeTruthy();
			const started = await inspector.request.patch(`/api/inspections/${id}`, {
				data: { status: "in_progress", startedAt: new Date().toISOString() },
			});
			expect(started.ok()).toBeTruthy();

			const earlyReport = await inspector.request.patch(
				`/api/inspections/${id}/report`,
				{
					data: {
						report: {
							overview: {},
							exterior: [],
							interior: [],
							mechanical: [],
							roadTest: [],
							verdict: "good",
							summary: { written: "Too early", fixes: [] },
						},
						lock: true,
					},
				},
			);
			expect(earlyReport.status()).toBe(400);

			const withoutPhotos = await inspector.request.patch(
				`/api/inspections/${id}`,
				{
					data: {
						status: "report_processing",
						completedPhysicalAt: new Date().toISOString(),
					},
				},
			);
			expect(withoutPhotos.status()).toBe(400);
		} finally {
			await buyer.close();
			await inspector.close();
		}
	});

	test("concurrent requests cannot double-book an inspector slot", async ({
		browser,
	}) => {
		const buyer = await browser.newContext();
		const inspector = await browser.newContext();
		try {
			await login(buyer.request, "buyer@test.local");
			await login(inspector.request, "inspector@test.local");
			const inspectorId = await userId(inspector.request);
			const scheduledFor = new Date(Date.now() + 691_200_000).toISOString();
			const payload = booking(inspectorId, scheduledFor, "10:00");
			const responses = await Promise.all([
				buyer.request.post("/api/inspections", { data: payload }),
				buyer.request.post("/api/inspections", { data: payload }),
			]);
			expect(responses.map((response) => response.status()).sort()).toEqual([
				201, 409,
			]);
		} finally {
			await buyer.close();
			await inspector.close();
		}
	});

	test("declining is allowed only from assigned and releases the slot", async ({
		browser,
	}) => {
		const buyer = await browser.newContext();
		const inspector = await browser.newContext();
		try {
			await login(buyer.request, "buyer@test.local");
			await login(inspector.request, "inspector@test.local");
			const inspectorId = await userId(inspector.request);
			const scheduledFor = new Date(Date.now() + 777_600_000).toISOString();
			const payload = booking(inspectorId, scheduledFor, "12:00");
			const first = await buyer.request.post("/api/inspections", { data: payload });
			const id = (await first.json()).data.inspection._id as string;
			const declined = await inspector.request.patch(`/api/inspections/${id}`, {
				data: { status: "declined" },
			});
			expect(declined.ok()).toBeTruthy();
			const cannotResume = await inspector.request.patch(
				`/api/inspections/${id}`,
				{ data: { status: "scheduled", acceptedAt: new Date().toISOString() } },
			);
			expect(cannotResume.status()).toBe(400);
			const replacement = await buyer.request.post("/api/inspections", {
				data: { ...payload, car: { ...payload.car, model: "Replacement" } },
			});
			expect(replacement.status()).toBe(201);
		} finally {
			await buyer.close();
			await inspector.close();
		}
	});
});
