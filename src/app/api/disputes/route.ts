import { z } from "zod";
import {
	ErrForbidden,
	ErrInspectionNotFound,
	ErrInvalidFields,
} from "@/server/constants/errors";
import { created, withApiHandler, withAuth } from "@/server/lib";
import { createDispute } from "@/server/services/disputes";
import { getInspectionById } from "@/server/services/inspections";

export const runtime = "nodejs";

const bodySchema = z
	.object({
		inspectionId: z.string().trim().min(1),
		statement: z.string().trim().min(5).max(4000),
	})
	.strict();

// Buyers raise a dispute / report against one of their own inspections. The
// dispute lands in the admin queue (see /admin/disputes).
export const POST = withApiHandler(
	{
		route: "/api/disputes",
		rateLimit: { windowMs: 60_000, maxRequests: 20 },
	},
	withAuth(async ({ req, auth }) => {
		if (auth.role !== "buyer" && auth.role !== "admin") throw ErrForbidden;

		const body = await req.json().catch(() => null);
		const parsed = bodySchema.safeParse(body);
		if (!parsed.success) throw ErrInvalidFields;

		const ins = await getInspectionById({ id: parsed.data.inspectionId });
		if (!ins) throw ErrInspectionNotFound;
		// A buyer may only dispute their own inspection.
		if (auth.role === "buyer" && ins.buyerId.toString() !== auth.userId) {
			throw ErrForbidden;
		}

		const dispute = await createDispute({
			inspectionId: parsed.data.inspectionId,
			raisedBy: auth.userId,
			statement: parsed.data.statement,
		});

		return created({ dispute }, "Dispute submitted");
	}),
);
