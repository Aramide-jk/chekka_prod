import type { Types } from "mongoose";
import { ErrForbidden, ErrInspectionNotFound, ErrInvalidAction } from "@/server/constants/errors";
import { created, withApiHandler, withAuth } from "@/server/lib";
import {
	createShareLink,
	getInspectionById,
} from "@/server/services/inspections";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withApiHandler<Ctx>(
	{
		route: "/api/inspections/:id/share",
		rateLimit: { windowMs: 60_000, maxRequests: 60 },
	},
	withAuth<Ctx>(async ({ auth, context }) => {
		const { id } = await context.params;
		const ins = await getInspectionById({ id });
		if (!ins) throw ErrInspectionNotFound;

		const ownsIt =
			(ins.buyerId as Types.ObjectId).toString() === auth.userId;
		if (!ownsIt && auth.role !== "admin") throw ErrForbidden;
		if (ins.status !== "completed" || !ins.report || !ins.reportLockedAt)
			throw ErrInvalidAction;

		const { nonce } = await createShareLink({ inspectionId: id });
		return created(
			{ nonce, path: `/share/${nonce}` },
			"Share link created",
		);
	}),
);
