import { ok, withApiHandler } from "@/server/lib";
import { getSiteConfig } from "@/server/services/siteConfigs";

export const runtime = "nodejs";

export const GET = withApiHandler(
	{
		route: "/api/site-config",
		rateLimit: { windowMs: 60_000, maxRequests: 300 },
	},
	async () => {
		const config = await getSiteConfig();
		return ok({
			pricing: {
				standardInspectionPrice: config.pricing.standardInspectionPrice,
				premiumInspectionPrice: config.pricing.premiumInspectionPrice,
				platformFee: config.pricing.platformFee,
			},
			general: {
				bookingEnabled: config.general.bookingEnabled,
				signupEnabled: config.general.signupEnabled,
				inspectorApplicationsOpen: config.general.inspectorApplicationsOpen,
				consultantChatEnabled: config.general.consultantChatEnabled,
			},
		});
	},
);
