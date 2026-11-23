import "server-only";
import crypto from "node:crypto";
import { sendEmail } from "@/constants";
import { Redis } from "@/server/databases/redis";
import { User } from "@/server/models/users";

const TTL_SECONDS = 10 * 60; // 10 minutes

function redisKey(email: string): string {
	const digest = crypto
		.createHash("sha256")
		.update(email.trim().toLowerCase())
		.digest("hex");
	return `auth:password-reset:${digest}`;
}

function hash(code: string): string {
	return crypto.createHash("sha256").update(code).digest("hex");
}

/**
 * Initiates the password reset pipeline:
 * Generates a 6-digit OTP, stores it in Redis with a 10-minute TTL,
 * and sends an email to the user.
 *
 * Always returns `{ sent: true }` to avoid revealing whether an account exists.
 */
export default async function forgotPassword({
	identifier,
}: {
	identifier: string;
}): Promise<{ sent: true }> {
	const clean = identifier.trim().toLowerCase();
	let user = null;

	if (clean.includes("@")) {
		user = await User.findOne({ email: clean, deleted: false }).exec();
	} else {
		user = await User.findOne({
			$or: [{ username: clean }, { phone: identifier.trim() }],
			deleted: false,
		}).exec();
	}

	if (!user || !user.email) {
		return { sent: true };
	}

	const normalisedEmail = user.email.trim().toLowerCase();
	const isLocalTestAddress =
		process.env.NODE_ENV !== "production" &&
		normalisedEmail.endsWith("@test.local");

	const code = isLocalTestAddress
		? "000000"
		: String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");

	await Redis.setex(redisKey(normalisedEmail), TTL_SECONDS, hash(code));

	if (isLocalTestAddress) {
		return { sent: true };
	}

	await sendEmail({
		toEmail: normalisedEmail,
		toName: user.fullName,
		subject: "Reset your password · Chekka",
		message: `Your Chekka password reset code is ${code}. It expires in 10 minutes. If you did not request a password reset, you can safely ignore this email.`,
		code,
	}).catch(() => false);

	return { sent: true };
}
