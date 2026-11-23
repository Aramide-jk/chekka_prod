import "server-only";
import { ErrInvalidAction } from "@/server/constants/errors";

interface PaystackEnvelope<T> { status: boolean; message: string; data: T }
export interface PaystackPaymentData {
	id: number | string;
	reference: string;
	amount: number;
	currency: string;
	status: string;
}

function testMode(): boolean {
	return process.env.NODE_ENV !== "production" && process.env.PAYSTACK_TEST_MODE === "1";
}

async function call<T>(path: string, init: RequestInit): Promise<T> {
	const secret = process.env.PAYSTACK_SECRET_KEY;
	if (!secret) throw ErrInvalidAction;
	const base = process.env.PAYSTACK_API_BASE_URL || "https://api.paystack.co";
	const response = await fetch(`${base}${path}`, {
		...init,
		headers: {
			Authorization: `Bearer ${secret}`,
			"Content-Type": "application/json",
			...(init.headers ?? {}),
		},
	});
	const body = (await response.json().catch(() => null)) as PaystackEnvelope<T> | null;
	if (!response.ok || !body?.status) throw ErrInvalidAction;
	return body.data;
}

export async function initializePaystackPayment(input: {
	email: string;
	amount: number;
	currency: string;
	reference: string;
	callbackUrl: string;
	metadata: Record<string, string>;
}) {
	if (testMode()) return {
		authorization_url: `${input.callbackUrl}?reference=${encodeURIComponent(input.reference)}`,
		access_code: `test_${input.reference}`,
		reference: input.reference,
	};
	return call<{ authorization_url: string; access_code: string; reference: string }>(
		"/transaction/initialize",
		{ method: "POST", body: JSON.stringify({
			email: input.email,
			amount: input.amount,
			currency: input.currency,
			reference: input.reference,
			callback_url: input.callbackUrl,
			metadata: input.metadata,
		}) },
	);
}

export async function verifyPaystackPayment(
	reference: string,
	expected?: { amount: number; currency: string },
): Promise<PaystackPaymentData> {
	if (testMode() && expected) return {
		id: `test_${reference}`,
		reference,
		amount: expected.amount,
		currency: expected.currency,
		status: "success",
	};
	return call<PaystackPaymentData>(`/transaction/verify/${encodeURIComponent(reference)}`, { method: "GET" });
}

export async function createPaystackRecipient(input: {
	name: string;
	accountNumber: string;
	bankCode: string;
}) {
	if (testMode()) return { recipient_code: `RCP_test_${input.accountNumber.slice(-4)}` };
	return call<{ recipient_code: string }>("/transferrecipient", {
		method: "POST",
		body: JSON.stringify({
			type: "nuban",
			name: input.name,
			account_number: input.accountNumber,
			bank_code: input.bankCode,
			currency: "NGN",
		}),
	});
}

export async function initiatePaystackTransfer(input: {
	amount: number;
	recipient: string;
	reference: string;
	reason: string;
}) {
	if (testMode()) return { transfer_code: `TRF_test_${input.reference}`, reference: input.reference };
	return call<{ transfer_code: string; reference: string }>("/transfer", {
		method: "POST",
		body: JSON.stringify({ source: "balance", ...input }),
	});
}
