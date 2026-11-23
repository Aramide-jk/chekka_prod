import type { NextRequest } from "next/server";
import { ErrInvalidFields } from "@/server/constants/errors";
import { ok, withApiHandler } from "@/server/lib";
import { resetPassword } from "@/server/services/auth";
import { resetPasswordBodySchema } from "@/server/validators/auth/validate";

export const runtime = "nodejs";

export const POST = withApiHandler(
	{
		route: "/api/auth/reset-password",
		rateLimit: { windowMs: 60_000, maxRequests: 5 },
	},
	async ({ req }: { req: NextRequest; context: unknown }) => {
		const body = await req.json().catch(() => null);
		const parsed = resetPasswordBodySchema.safeParse(body);
		if (!parsed.success) {
			throw ErrInvalidFields;
		}

		await resetPassword({
			identifier: parsed.data.identifier,
			code: parsed.data.code,
			newPassword: parsed.data.newPassword,
		});

		return ok({ reset: true }, "Password updated successfully");
	},
);
