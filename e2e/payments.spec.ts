import crypto from "node:crypto";
import { type APIRequestContext, expect, test } from "@playwright/test";
import { isVerifiedPaymentExact } from "../src/server/services/transactions/validatePayment";

const PASSWORD = process.env.SEED_DEFAULT_PASSWORD ?? "password123";
const TEST_SECRET = "sk_test_playwright_placeholder";

async function login(request: APIRequestContext, email: string) {
	const response = await request.post("/api/auth/login", {
		data: { email, password: PASSWORD },
	});
	expect(response.status()).toBe(200);
}

async function createInspection(request: APIRequestContext) {
	const response = await request.post("/api/inspections", {
		data: {
			inspectionType: "standard",
			car: {
				make: "PaymentTest",
				model: `Snapshot-${Date.now()}`,
				year: 2024,
				sellerType: "private",
				city: "Lagos",
				address: "Test address",
			},
		},
	});
	expect(response.status()).toBe(201);
	return (await response.json()).data.inspection;
}

async function initialize(request: APIRequestContext, inspectionId: string) {
	const response = await request.post("/api/transactions/initialize", {
		data: { inspectionId },
	});
	expect(response.status()).toBe(200);
	return (await response.json()).data;
}

async function webhook(
	request: APIRequestContext,
	event: object,
	valid = true,
) {
	const raw = JSON.stringify(event);
	const signature = crypto
		.createHmac("sha512", valid ? TEST_SECRET : "wrong")
		.update(raw)
		.digest("hex");
	return request.post("/api/webhooks/paystack", {
		data: raw,
		headers: {
			"content-type": "application/json",
			"x-paystack-signature": signature,
		},
	});
}

async function completePaidInspection(input: {
	buyer: APIRequestContext;
	inspector: APIRequestContext;
	admin: APIRequestContext;
	withPayoutAccount: boolean;
}) {
	const me = await input.inspector.get("/api/users/me");
	const inspectorUser = (await me.json()).data.user;
	const inspectorId = inspectorUser._id ?? inspectorUser.id;
	await input.admin.patch("/api/admin/site-config", {
		data: {
			inspections: { minPhotos: 1 },
			pricing: { platformCommissionPercent: 10 },
		},
	});
	if (input.withPayoutAccount) {
		expect(
			(
				await input.inspector.patch("/api/inspector-profiles/me", {
					data: {
						payoutAccount: {
							bankCode: "058",
							accountNumber: "0123456789",
							accountName: "Test Inspector",
						},
					},
				})
			).status(),
		).toBe(200);
	}
	const scheduledFor = new Date(
		Date.now() + 7 * 86_400_000 + Math.floor(Math.random() * 3600_000),
	).toISOString();
	const create = await input.buyer.post("/api/inspections", {
		data: {
			inspectionType: "standard",
			car: {
				make: "PayoutTest",
				model: "Flow",
				year: 2024,
				sellerType: "private",
				city: "Lagos",
				address: "Test address",
			},
			assignedInspectorId: inspectorId,
			scheduledFor,
			slot: "09:00",
		},
	});
	expect(create.status()).toBe(201);
	const inspectionId = (await create.json()).data.inspection._id;
	const initialized = await initialize(input.buyer, inspectionId);
	expect(
		(
			await webhook(input.buyer, {
				event: "charge.success",
				data: { reference: initialized.reference },
			})
		).status(),
	).toBe(200);
	expect(
		(
			await input.inspector.patch(`/api/inspections/${inspectionId}`, {
				data: {
					status: "scheduled",
					acceptedAt: new Date().toISOString(),
				},
			})
		).status(),
	).toBe(200);
	expect(
		(
			await input.inspector.patch(`/api/inspections/${inspectionId}`, {
				data: { sellerContactedAt: new Date().toISOString() },
			})
		).status(),
	).toBe(200);
	expect(
		(
			await input.inspector.patch(`/api/inspections/${inspectionId}`, {
				data: {
					status: "in_progress",
					startedAt: new Date().toISOString(),
				},
			})
		).status(),
	).toBe(200);
	expect(
		(
			await input.inspector.post(
				`/api/inspections/${inspectionId}/photos`,
				{
					multipart: {
						section: "exterior",
						photo: {
							name: "proof.jpg",
							mimeType: "image/jpeg",
							buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
						},
					},
				},
			)
		).status(),
	).toBe(201);
	expect(
		(
			await input.inspector.patch(`/api/inspections/${inspectionId}`, {
				data: {
					status: "report_processing",
					completedPhysicalAt: new Date().toISOString(),
				},
			})
		).status(),
	).toBe(200);
	const report = {
		overview: {},
		exterior: [],
		interior: [],
		mechanical: [],
		roadTest: [],
		verdict: "good",
		summary: {
			passed: 0,
			minor: 0,
			serious: 0,
			written: "Verified",
			fixes: [],
		},
	};
	expect(
		(
			await input.inspector.patch(
				`/api/inspections/${inspectionId}/report`,
				{ data: { report, lock: true } },
			)
		).status(),
	).toBe(200);
	const transaction = (
		await (
			await input.buyer.get(`/api/transactions/${initialized.reference}`)
		).json()
	).data.transaction;
	return { transaction, initialized };
}

async function createApprovedInspector(
	inspector: APIRequestContext,
	admin: APIRequestContext,
) {
	const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
	const account = {
		fullName: "Payout Inspector",
		username: `payout_${suffix}`,
		email: `payout_${suffix}@test.local`,
		phone: `+23482${suffix.slice(-8)}`,
		password: PASSWORD,
		role: "inspector",
	};
	await inspector.post("/api/auth/signup/verification", {
		data: { email: account.email, fullName: account.fullName },
	});
	expect(
		(
			await inspector.post("/api/auth/signup", {
				data: { ...account, verificationCode: "000000" },
			})
		).status(),
	).toBe(201);
	expect(
		(
			await inspector.post("/api/inspector-profiles/apply", {
				multipart: {
					yearsExperience: "3",
					city: "Lagos",
					idDocument: {
						name: "id.jpg",
						mimeType: "image/jpeg",
						buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
					},
				},
			})
		).status(),
	).toBe(201);
	const me = await inspector.get("/api/users/me");
	const user = (await me.json()).data.user;
	const userId = user._id ?? user.id;
	expect(
		(
			await admin.patch(`/api/admin/inspectors/${userId}`, {
				data: { action: "approve" },
			})
		).status(),
	).toBe(200);
}

test.describe("Paystack financial workflow", () => {
	test.setTimeout(120_000);
	test("provider confirmation requires exact success, reference, amount, and currency", () => {
		const expected = {
			reference: "chk_exact",
			amountMinor: 250_000,
			currency: "NGN",
		};
		const valid = {
			status: "success",
			reference: "chk_exact",
			amount: 250_000,
			currency: "NGN",
		};
		expect(isVerifiedPaymentExact(expected, valid)).toBe(true);
		expect(
			isVerifiedPaymentExact(expected, { ...valid, status: "failed" }),
		).toBe(false);
		expect(
			isVerifiedPaymentExact(expected, {
				...valid,
				reference: "chk_other",
			}),
		).toBe(false);
		expect(
			isVerifiedPaymentExact(expected, { ...valid, amount: 249_999 }),
		).toBe(false);
		expect(
			isVerifiedPaymentExact(expected, { ...valid, currency: "USD" }),
		).toBe(false);
	});
	test("admin commission is validated and unauthorized users cannot change it", async ({
		browser,
	}) => {
		const admin = await browser.newContext();
		const buyer = await browser.newContext();
		await login(admin.request, "admin@test.local");
		await login(buyer.request, "buyer@test.local");
		const config = await admin.request.get("/api/admin/site-config");
		expect(
			(await config.json()).data.config.pricing.platformCommissionPercent,
		).toBeGreaterThanOrEqual(0);
		expect(
			(
				await buyer.request.patch("/api/admin/site-config", {
					data: { pricing: { platformCommissionPercent: 12 } },
				})
			).status(),
		).toBe(403);
		expect(
			(
				await admin.request.patch("/api/admin/site-config", {
					data: { pricing: { platformCommissionPercent: 101 } },
				})
			).status(),
		).toBe(400);
		expect(
			(
				await admin.request.patch("/api/admin/site-config", {
					data: { pricing: { platformCommissionPercent: 10 } },
				})
			).status(),
		).toBe(200);
		await admin.close();
		await buyer.close();
	});

	test("payment stays pending, trusted confirmation makes it paid/held, and snapshots do not change", async ({
		browser,
	}) => {
		const buyer = await browser.newContext();
		const admin = await browser.newContext();
		await login(buyer.request, "buyer@test.local");
		await login(admin.request, "admin@test.local");
		await admin.request.patch("/api/admin/site-config", {
			data: { pricing: { platformCommissionPercent: 10 } },
		});

		const inspection = await createInspection(buyer.request);
		const initialized = await initialize(buyer.request, inspection._id);
		let transaction = (
			await (
				await buyer.request.get(
					`/api/transactions/${initialized.reference}`,
				)
			).json()
		).data.transaction;
		expect(transaction.status).toBe("pending");
		expect(transaction.payoutStatus).toBe("not_eligible");
		expect(transaction.amountMinor).toBe(
			(inspection.price + inspection.platformFee) * 100,
		);
		expect(transaction.platformCommissionPercent).toBe(10);
		expect(transaction.platformCommissionAmountMinor).toBe(
			Math.round(transaction.amountMinor * 0.1),
		);
		expect(transaction.inspectorPayableAmountMinor).toBe(
			transaction.amountMinor - transaction.platformCommissionAmountMinor,
		);

		expect(
			(
				await webhook(
					buyer.request,
					{
						event: "charge.success",
						data: { reference: initialized.reference },
					},
					false,
				)
			).status(),
		).toBe(403);
		expect(
			(
				await webhook(buyer.request, {
					event: "charge.success",
					data: { reference: initialized.reference },
				})
			).status(),
		).toBe(200);
		expect(
			(
				await webhook(buyer.request, {
					event: "charge.success",
					data: { reference: initialized.reference },
				})
			).status(),
		).toBe(200);
		transaction = (
			await (
				await buyer.request.get(
					`/api/transactions/${initialized.reference}`,
				)
			).json()
		).data.transaction;
		expect(transaction.status).toBe("paid");
		expect(transaction.payoutStatus).toBe("held");

		const commissionUpdate = await admin.request.patch(
			"/api/admin/site-config",
			{ data: { pricing: { platformCommissionPercent: 12 } } },
		);
		expect(commissionUpdate.status()).toBe(200);
		expect(
			(await commissionUpdate.json()).data.config.pricing
				.platformCommissionPercent,
		).toBe(12);
		const oldAfterChange = (
			await (
				await buyer.request.get(
					`/api/transactions/${initialized.reference}`,
				)
			).json()
		).data.transaction;
		expect(oldAfterChange.platformCommissionPercent).toBe(10);
		const second = await initialize(
			buyer.request,
			(await createInspection(buyer.request))._id,
		);
		const secondTx = (
			await (
				await buyer.request.get(`/api/transactions/${second.reference}`)
			).json()
		).data.transaction;
		expect(secondTx.platformCommissionPercent).toBe(12);
		expect(
			(
				await admin.request.post(
					`/api/admin/transactions/${secondTx._id}/payout`,
				)
			).status(),
		).toBe(400);
		await buyer.close();
		await admin.close();
	});

	test("completion gates payout, reuses its transfer reference, and trusted transfer events finalize it", async ({
		browser,
	}) => {
		const buyer = await browser.newContext();
		const inspector = await browser.newContext();
		const admin = await browser.newContext();
		await login(buyer.request, "buyer@test.local");
		await login(inspector.request, "inspector@test.local");
		await login(admin.request, "admin@test.local");
		const { transaction } = await completePaidInspection({
			buyer: buyer.request,
			inspector: inspector.request,
			admin: admin.request,
			withPayoutAccount: true,
		});
		expect(transaction.payoutStatus).toBe("processing");
		expect(transaction.transferReference).toBeTruthy();
		const retry = await admin.request.post(
			`/api/admin/transactions/${transaction._id}/payout`,
		);
		expect(retry.status()).toBe(200);
		expect((await retry.json()).data.transaction.transferReference).toBe(
			transaction.transferReference,
		);
		const event = {
			event: "transfer.success",
			data: {
				reference: transaction.transferReference,
				transfer_code: "TRF_test_success",
			},
		};
		expect((await webhook(admin.request, event)).status()).toBe(200);
		expect((await webhook(admin.request, event)).status()).toBe(200);
		const released = (
			await (
				await buyer.request.get(
					`/api/transactions/${transaction.paystackRef}`,
				)
			).json()
		).data.transaction;
		expect(released.payoutStatus).toBe("released");
		await buyer.close();
		await inspector.close();
		await admin.close();
	});

	test("missing payout details remain actionable and failed transfers never mark an inspector paid", async ({
		browser,
	}) => {
		const buyer = await browser.newContext();
		const inspector = await browser.newContext();
		const admin = await browser.newContext();
		await login(buyer.request, "buyer@test.local");
		await login(admin.request, "admin@test.local");
		await createApprovedInspector(inspector.request, admin.request);
		const { transaction } = await completePaidInspection({
			buyer: buyer.request,
			inspector: inspector.request,
			admin: admin.request,
			withPayoutAccount: false,
		});
		expect(transaction.payoutStatus).toBe("action_required");
		expect(
			(
				await inspector.request.patch("/api/inspector-profiles/me", {
					data: {
						payoutAccount: {
							bankCode: "058",
							accountNumber: "0123456788",
							accountName: "Payout Inspector",
						},
					},
				})
			).status(),
		).toBe(200);
		const retry = await admin.request.post(
			`/api/admin/transactions/${transaction._id}/payout`,
		);
		expect(retry.status()).toBe(200);
		const processing = (await retry.json()).data.transaction;
		expect(processing.payoutStatus).toBe("processing");
		const failedEvent = {
			event: "transfer.failed",
			data: {
				reference: processing.transferReference,
				reason: "Test decline",
			},
		};
		expect((await webhook(admin.request, failedEvent)).status()).toBe(200);
		expect((await webhook(admin.request, failedEvent)).status()).toBe(200);
		const failed = (
			await (
				await buyer.request.get(
					`/api/transactions/${transaction.paystackRef}`,
				)
			).json()
		).data.transaction;
		expect(failed.payoutStatus).toBe("failed");
		expect(failed.releasedAt).toBeFalsy();
		await buyer.close();
		await inspector.close();
		await admin.close();
	});
});
