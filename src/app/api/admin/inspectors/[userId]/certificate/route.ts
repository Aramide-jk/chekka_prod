import { z } from "zod";
import { ErrInvalidFields } from "@/server/constants/errors";
import { ok, withApiHandler, withPermission } from "@/server/lib";
import { setCertificateApproval } from "@/server/services/admin";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ userId: string }> };

const bodySchema = z.object({ approved: z.boolean() }).strict();

// Approve / revoke an inspector's professional certificate (the "Certified
// Inspector" badge). Gated by the same permission as inspector approval.
export const PATCH = withApiHandler<Ctx>(
	{
		route: "/api/admin/inspectors/:userId/certificate",
		rateLimit: { windowMs: 60_000, maxRequests: 60 },
	},
	withPermission<Ctx>("inspectors.approve", async ({ req, context }) => {
		const { userId } = await context.params;
		const body = await req.json().catch(() => null);
		const parsed = bodySchema.safeParse(body);
		if (!parsed.success) throw ErrInvalidFields;

		const profile = await setCertificateApproval({
			userId,
			approved: parsed.data.approved,
		});
		return ok({ profile });
	}),
);
