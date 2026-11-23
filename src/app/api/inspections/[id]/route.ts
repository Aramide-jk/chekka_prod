import {
	ErrForbidden,
	ErrInspectionNotFound,
	ErrInspectorNotApproved,
	ErrInvalidFields,
} from "@/server/constants/errors";
import { ok, withApiHandler, withAuth } from "@/server/lib";
import {
	enrichInspection,
	getInspectionById,
	updateInspection,
} from "@/server/services/inspections";
import type { InspectionStatus } from "@/server/types";
import { updateInspectionBodySchema } from "@/server/validators/inspections/validate";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

function canAccess(
	role: string,
	userId: string,
	ins: {
		buyerId: { toString(): string };
		inspectorId?: unknown;
		assignedInspectorId?: unknown;
	},
) {
	if (role === "admin" || role === "consultant") return true;
	if (role === "buyer") return ins.buyerId.toString() === userId;
	if (role === "inspector") {
		const insp = (
			ins.inspectorId as { toString(): string } | undefined
		)?.toString();
		const assigned = (
			ins.assignedInspectorId as { toString(): string } | undefined
		)?.toString();
		return insp === userId || assigned === userId;
	}
	return false;
}

export const GET = withApiHandler<Ctx>(
	{
		route: "/api/inspections/:id",
		rateLimit: { windowMs: 60_000, maxRequests: 300 },
	},
	withAuth<Ctx>(async ({ auth, context }) => {
		const { id } = await context.params;
		const ins = await getInspectionById({ id });
		if (!ins) throw ErrInspectionNotFound;
		if (!canAccess(auth.role, auth.userId, ins)) throw ErrForbidden;
		return ok({
			inspection: await enrichInspection(ins, {
				role: auth.role,
				userId: auth.userId,
			}),
		});
	}),
);

export const PATCH = withApiHandler<Ctx>(
	{
		route: "/api/inspections/:id",
		rateLimit: { windowMs: 60_000, maxRequests: 120 },
	},
	withAuth<Ctx>(async ({ req, auth, context }) => {
		const { id } = await context.params;
		const ins = await getInspectionById({ id, refreshCache: true });
		if (!ins) throw ErrInspectionNotFound;
		if (!canAccess(auth.role, auth.userId, ins)) throw ErrForbidden;
		if (auth.role !== "inspector") throw ErrForbidden;

		const body = await req.json().catch(() => null);
		const parsed = updateInspectionBodySchema.safeParse(body);
		if (!parsed.success) throw ErrInvalidFields;

		// Inspector job gating: an inspector may only take on or progress a job
		// once their account is approved. (The "contact the seller before
		// starting" rule is enforced in the inspector UI — the Start button is
		// disabled until the seller is marked contacted.)
		const accepting =
			!!parsed.data.acceptedAt ||
			parsed.data.status === "scheduled" ||
			parsed.data.status === "in_progress";
		if (accepting && auth.status !== "approved") {
			throw ErrInspectorNotApproved;
		}

		const patch: Record<string, unknown> = { ...parsed.data };
		if (parsed.data.status)
			patch.status = parsed.data.status as InspectionStatus;
		for (const k of [
			"sellerContactedAt",
			"acceptedAt",
			"startedAt",
			"completedPhysicalAt",
			"completedAt",
			"scheduledFor",
		] as const) {
			if (parsed.data[k]) patch[k] = new Date();
		}

		const updated = await updateInspection({ id, previous: ins, patch });
		return ok({ inspection: updated });
	}),
);
