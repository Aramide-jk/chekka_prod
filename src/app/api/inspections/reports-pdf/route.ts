import { ErrForbidden } from "@/server/constants/errors";
import { withApiHandler, withAuth } from "@/server/lib";
import { buildReportsPdf, listForBuyer } from "@/server/services/inspections";

export const runtime = "nodejs";

// Streams every completed report for the authenticated buyer as a single PDF —
// the "Print All Reports" action on the dashboard links here.
export const GET = withApiHandler(
	{
		route: "/api/inspections/reports-pdf",
		rateLimit: { windowMs: 60_000, maxRequests: 20 },
	},
	withAuth(async ({ auth }) => {
		if (auth.role !== "buyer") throw ErrForbidden;
		const reports = await listForBuyer({
			buyerId: auth.userId,
			status: "completed",
			limit: 100,
		});
		const pdf = await buildReportsPdf(reports);
		return new Response(new Uint8Array(pdf), {
			status: 200,
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition":
					'attachment; filename="chekka-reports.pdf"',
				"Cache-Control": "no-store",
			},
		});
	}),
);
