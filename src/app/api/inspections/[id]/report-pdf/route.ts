import { ErrForbidden, ErrInspectionNotFound } from "@/server/constants/errors";
import { withApiHandler, withAuth } from "@/server/lib";
import {
	buildInspectionReportPdf,
	enrichInspection,
	getInspectionById,
} from "@/server/services/inspections";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const SECTIONS = [
	"Overview",
	"Vehicle Details",
	"Exterior",
	"Interior",
	"Mechanical",
	"Road Test",
	"Verdict",
] as const;

function canAccess(
	role: string,
	userId: string,
	ins: {
		buyerId: { toString(): string };
		inspectorId?: unknown;
		assignedInspectorId?: unknown;
	},
): boolean {
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

// Generates a single inspection's report as a clean, sectioned PDF — the buyer
// report view's "Download Full Report" and "Download Current Section" actions.
// `?section=<name>` renders only that category; absent → the whole report.
export const GET = withApiHandler<Ctx>(
	{
		route: "/api/inspections/:id/report-pdf",
		rateLimit: { windowMs: 60_000, maxRequests: 30 },
	},
	withAuth<Ctx>(async ({ req, auth, context }) => {
		const { id } = await context.params;
		const ins = await getInspectionById({ id });
		if (!ins) throw ErrInspectionNotFound;
		if (!canAccess(auth.role, auth.userId, ins)) throw ErrForbidden;

		const requested = new URL(req.url).searchParams.get("section");
		const section = SECTIONS.find((s) => s === requested);

		const enriched = await enrichInspection(ins, {
			role: auth.role,
			userId: auth.userId,
		});
		const inspector = enriched.inspector
			? {
					fullName: enriched.inspector.fullName,
					badge: enriched.inspector.badge,
					city: enriched.inspector.city,
					rating: enriched.inspector.rating,
					totalCompleted: enriched.inspector.totalCompleted,
				}
			: undefined;

		const pdf = await buildInspectionReportPdf(ins, { inspector, section });
		const slug = section
			? section.toLowerCase().replace(/\s+/g, "-")
			: "full-report";
		return new Response(new Uint8Array(pdf), {
			status: 200,
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="chekka-${slug}.pdf"`,
				"Cache-Control": "no-store",
			},
		});
	}),
);
