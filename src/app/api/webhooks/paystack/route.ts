import crypto from "node:crypto";
import { ErrForbidden } from "@/server/constants/errors";
import { ok, withApiHandler } from "@/server/lib";
import { confirmPayment, handleTransferEvent } from "@/server/services/transactions";

export const runtime = "nodejs";

export const POST = withApiHandler(
	{ route: "/api/webhooks/paystack", rateLimit: { windowMs: 60_000, maxRequests: 1000 } },
	async ({ req }) => {
		const raw = await req.text();
		const secret = process.env.PAYSTACK_SECRET_KEY;
		const signature = req.headers.get("x-paystack-signature") ?? "";
		if (!secret) throw ErrForbidden;
		const expected = crypto.createHmac("sha512", secret).update(raw).digest("hex");
		if (
			signature.length !== expected.length ||
			!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
		) throw ErrForbidden;

		const event = JSON.parse(raw) as {
			event?: string;
			data?: { reference?: string; transfer_code?: string; reason?: string };
		};
		if (event.event === "charge.success" && event.data?.reference) {
			await confirmPayment({ reference: event.data.reference });
		} else if (
			["transfer.success", "transfer.failed", "transfer.reversed"].includes(event.event ?? "") &&
			event.data?.reference
		) {
			await handleTransferEvent({
				event: event.event as "transfer.success" | "transfer.failed" | "transfer.reversed",
				reference: event.data.reference,
				transferCode: event.data.transfer_code,
				reason: event.data.reason,
			});
		}
		return ok({ received: true });
	},
);
