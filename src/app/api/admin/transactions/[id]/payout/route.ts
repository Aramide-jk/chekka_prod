import { ErrInvalidFields } from "@/server/constants/errors";
import { ok, withAdmin, withApiHandler } from "@/server/lib";
import { initiatePayoutForTransaction } from "@/server/services/transactions";

export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string }> };

export const POST = withApiHandler<Ctx>(
	{ route: "/api/admin/transactions/:id/payout", rateLimit: { windowMs: 60_000, maxRequests: 30 } },
	withAdmin<Ctx>(async ({ context }) => {
		const { id } = await context.params;
		if (!id) throw ErrInvalidFields;
		const transaction = await initiatePayoutForTransaction(id);
		return ok({ transaction }, "Payout submitted");
	}),
);
