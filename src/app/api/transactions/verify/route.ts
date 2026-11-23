import { NextResponse } from "next/server";
import { ErrForbidden, ErrInvalidFields } from "@/server/constants/errors";
import { withApiHandler, withAuth } from "@/server/lib";
import { confirmPayment } from "@/server/services/transactions";

export const runtime = "nodejs";

export const GET = withApiHandler(
	{ route: "/api/transactions/verify", rateLimit: { windowMs: 60_000, maxRequests: 30 } },
	withAuth(async ({ req, auth }) => {
		if (auth.role !== "buyer") throw ErrForbidden;
		const reference = req.nextUrl.searchParams.get("reference");
		if (!reference) throw ErrInvalidFields;
		const transaction = await confirmPayment({ reference, buyerId: auth.userId });
		return NextResponse.redirect(
			new URL(`/inspections/${transaction.inspectionId.toString()}`, req.url),
		);
	}),
);
