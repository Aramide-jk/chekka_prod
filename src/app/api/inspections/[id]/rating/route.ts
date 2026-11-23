import { z } from "zod";
import {
	ErrForbidden,
	ErrInspectionNotFound,
	ErrInvalidAction,
	ErrInvalidFields,
} from "@/server/constants/errors";
import { ok, withApiHandler, withAuth } from "@/server/lib";
import {
	getInspectionById,
	rateInspection,
} from "@/server/services/inspections";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const bodySchema = z
	.object({
		score: z.number().int().min(1).max(5),
		comment: z.string().trim().max(1000).optional(),
	})
	.strict();

// A buyer rates the inspector for one of their completed inspections (1–5).
export const POST = withApiHandler<Ctx>(
	{
		route: "/api/inspections/:id/rating",
		rateLimit: { windowMs: 60_000, maxRequests: 30 },
	},
	withAuth<Ctx>(async ({ req, auth, context }) => {
		const { id } = await context.params;
		const ins = await getInspectionById({ id });
		if (!ins) throw ErrInspectionNotFound;
		if (auth.role !== "buyer" || ins.buyerId.toString() !== auth.userId) {
			throw ErrForbidden;
		}
		// Can only rate once the work is done and an inspector was assigned.
		if (ins.status !== "completed") throw ErrInvalidAction;
		if (!ins.inspectorId && !ins.assignedInspectorId) {
			throw ErrInvalidAction;
		}

		const body = await req.json().catch(() => null);
		const parsed = bodySchema.safeParse(body);
		if (!parsed.success) throw ErrInvalidFields;

		const updated = await rateInspection({
			id,
			score: parsed.data.score,
			comment: parsed.data.comment,
		});
		return ok({ rating: updated?.rating ?? null });
	}),
);
