import { ErrForbidden, ErrInvalidAction } from "@/server/constants/errors";
import { ok, withApiHandler, withAuth } from "@/server/lib";
import { getTransactionByRefDB } from "@/server/models/transactions";

export const runtime = "nodejs";
type Ctx = { params: Promise<{ reference: string }> };

export const GET = withApiHandler<Ctx>(
	{ route: "/api/transactions/:reference", rateLimit: { windowMs: 60_000, maxRequests: 120 } },
	withAuth<Ctx>(async ({ auth, context }) => {
		const { reference } = await context.params;
		const transaction = await getTransactionByRefDB(reference);
		if (!transaction) throw ErrInvalidAction;
		if (auth.role !== "admin" && transaction.buyerId.toString() !== auth.userId) throw ErrForbidden;
		return ok({ transaction });
	}),
);
