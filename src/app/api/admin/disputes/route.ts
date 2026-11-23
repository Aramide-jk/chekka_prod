import { ok, withApiHandler, withPermission } from "@/server/lib";
import { enrichDisputes, listAll } from "@/server/services/disputes";

export const runtime = "nodejs";

export const GET = withApiHandler(
	{
		route: "/api/admin/disputes",
		rateLimit: { windowMs: 60_000, maxRequests: 300 },
	},
	withPermission("disputes.view", async () => {
		// Resolve buyer/inspector/vehicle identities so the admin queue can show
		// who is involved instead of bare ObjectIds.
		const disputes = await enrichDisputes(await listAll());
		return ok({ disputes });
	}),
);
