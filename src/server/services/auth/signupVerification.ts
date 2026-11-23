import "server-only";
import crypto from "node:crypto";
import { sendEmail } from "@/constants";
import { ErrInvalidAction, ErrInvalidOTP } from "@/server/constants/errors";
import { Redis } from "@/server/databases/redis";

const TTL_SECONDS = 10 * 60;

function key(email: string): string {
	const digest = crypto
		.createHash("sha256")
		.update(email.trim().toLowerCase())
		.digest("hex");
	return `auth:signup-verification:${digest}`;
}

function hash(code: string): string {
	return crypto.createHash("sha256").update(code).digest("hex");
}

export async function requestSignupVerification({
	email,
	fullName,
}: {
	email: string;
	fullName: string;
}): Promise<void> {
	const normalisedEmail = email.trim().toLowerCase();
	const isLocalTestAddress =
		process.env.NODE_ENV !== "production" &&
		normalisedEmail.endsWith("@test.local");
	const code = isLocalTestAddress
		? "000000"
		: String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");

	await Redis.setex(key(normalisedEmail), TTL_SECONDS, hash(code));
	if (isLocalTestAddress) return;

	const sent = await sendEmail({
		toEmail: normalisedEmail,
		toName: fullName,
		subject: "Verify your email · Chekka",
		message: `Welcome to Chekka! Your verification code is ${code}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`,
		code,
	});
	if (!sent) {
		await Redis.del(key(normalisedEmail));
		throw ErrInvalidAction;
	}
}

export async function consumeSignupVerification({
	email,
	code,
}: {
	email: string;
	code: string;
}): Promise<void> {
	const result = await Redis.eval(
		"local value = redis.call('GET', KEYS[1]); if value == ARGV[1] then redis.call('DEL', KEYS[1]); return 1; end; return 0;",
		1,
		key(email),
		hash(code),
	);
	if (result !== 1) throw ErrInvalidOTP;
}
