import "server-only";
import type { IUser } from "@/server/models/users";
import type { UserRole } from "@/server/types";
import createUser from "../users/createUser";
import { consumeSignupVerification } from "./signupVerification";

export interface ISignupInput {
	fullName: string;
	username: string;
	email: string;
	phone: string;
	password: string;
	role: UserRole;
	city?: string;
	verificationCode: string;
}

export default async function signup({
	payload,
}: {
	payload: ISignupInput;
}): Promise<IUser> {
	await consumeSignupVerification({
		email: payload.email,
		code: payload.verificationCode,
	});
	const status = payload.role === "inspector" ? "pending" : "active";
	const { verificationCode: _verificationCode, ...userPayload } = payload;
	return createUser({ payload: { ...userPayload, status } });
}
