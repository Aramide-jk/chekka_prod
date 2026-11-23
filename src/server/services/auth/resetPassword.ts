import "server-only";
import crypto from "node:crypto";
import { ErrInvalidOTP, ErrUserNotFound } from "@/server/constants/errors";
import { Redis } from "@/server/databases/redis";
import { User, changePasswordDB } from "@/server/models/users";
import invalidateCacheKeys from "../users/utils/invalidateCacheKeys";

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

export default async function resetPassword({
	identifier,
	code,
	newPassword,
}: {
	identifier: string;
	code: string;
	newPassword: string;
}): Promise<{ success: true }> {
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
		throw ErrUserNotFound;
	}

	const normalisedEmail = user.email.trim().toLowerCase();
	const key = redisKey(normalisedEmail);
	const hashedCode = hash(code.trim());

	const result = await Redis.eval(
		"local value = redis.call('GET', KEYS[1]); if value == ARGV[1] then redis.call('DEL', KEYS[1]); return 1; end; return 0;",
		1,
		key,
		hashedCode,
	);

	if (result !== 1) {
		throw ErrInvalidOTP;
	}

	const ok = await changePasswordDB(user._id.toString(), newPassword);
	if (!ok) {
		throw ErrUserNotFound;
	}

	await invalidateCacheKeys({ id: user._id.toString() });

	return { success: true };
}
