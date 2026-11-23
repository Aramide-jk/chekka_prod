import { ErrInvalidFields } from "@/server/constants/errors";
import { ok, withApiHandler } from "@/server/lib";
import { requestSignupVerification } from "@/server/services/auth/signupVerification";
import { signupVerificationBodySchema } from "@/server/validators/auth/validate";

export const runtime = "nodejs";

export const POST = withApiHandler(
	{
		route: "/api/auth/signup/verification",
		rateLimit: { windowMs: 60_000, maxRequests: 10 },
	},
	async ({ req }) => {
		const body = await req.json().catch(() => null);
		const parsed = signupVerificationBodySchema.safeParse(body);
		if (!parsed.success) throw ErrInvalidFields;
		await requestSignupVerification(parsed.data);
		return ok({ sent: true }, "Verification code sent");
	},
);
