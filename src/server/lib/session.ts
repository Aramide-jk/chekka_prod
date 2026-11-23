import "server-only";
import type { NextResponse } from "next/server";
import { s3GetFileLink } from "../helpers";
import type { IUser } from "../models/users";
import { setAuthCookies } from "./cookies";
import { type IJwtPayload, mintTokens } from "./jwt";

export interface ISessionUser {
	id: string;
	fullName: string;
	username: string;
	email: string;
	phone?: string;
	role: IUser["role"];
	status: IUser["status"];
	avatar?: string;
	city?: string;
	onboardingCompleted: boolean;
	// Only populated for `manager` role; empty array for everyone else. Admins
	// don't need it (they have implicit full access via `hasPermission`).
	permissions?: string[];
}

export function toSessionUser(u: IUser): ISessionUser {
	return {
		id: u._id.toString(),
		fullName: u.fullName,
		username: u.username,
		email: u.email,
		phone: u.phone,
		role: u.role,
		status: u.status,
		avatar: u.avatar,
		city: u.city,
		onboardingCompleted: u.onboardingCompleted,
		permissions: u.role === "manager" ? (u.permissions ?? []) : undefined,
	};
}

// Avatars are persisted as S3 keys. Any session payload bound for the client
// must resolve that key to a viewer-ready (presigned / proxied) URL so the
// header and settings UI can render it directly. Cheap to recompute (signing is
// CPU-only), so we do it at each read boundary rather than caching the URL.
const AVATAR_LINK_TTL_SECONDS = 60 * 60;

export async function resolveSessionAvatar(
	user: ISessionUser,
): Promise<ISessionUser> {
	if (!user.avatar) return user;
	const url = await s3GetFileLink({
		fileName: user.avatar,
		expiresInSeconds: AVATAR_LINK_TTL_SECONDS,
	}).catch(() => user.avatar);
	return { ...user, avatar: url };
}

export function attachSession(res: NextResponse, user: IUser): NextResponse {
	const payload: IJwtPayload = {
		userId: user._id.toString(),
		role: user.role,
		status: user.status,
	};
	setAuthCookies(res, mintTokens(payload));
	return res;
}
