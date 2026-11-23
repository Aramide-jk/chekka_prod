import { z } from "zod";

export const loginBodySchema = z
	.object({
		email: z.string().trim().toLowerCase().email(),
		password: z.string().min(1).max(120),
	})
	.strict();

export const signupBodySchema = z
	.object({
		fullName: z.string().trim().min(2).max(120),
		username: z
			.string()
			.trim()
			.min(2)
			.max(40)
			.regex(
				/^[a-z0-9_.-]+$/i,
				"Username can only contain letters, numbers, _, ., -",
			),
		email: z.string().trim().toLowerCase().email(),
		phone: z.string().trim().min(7).max(20),
		password: z.string().min(8).max(120),
		role: z.enum(["buyer", "inspector"]).default("buyer"),
		city: z.string().trim().max(80).optional(),
		verificationCode: z.string().regex(/^\d{6}$/),
	})
	.strict();

export const signupVerificationBodySchema = z
	.object({
		email: z.string().trim().toLowerCase().email(),
		fullName: z.string().trim().min(2).max(120),
	})
	.strict();

export const forgotPasswordBodySchema = z
	.object({
		identifier: z.string().trim().min(3).max(120),
	})
	.strict();

export const resetPasswordBodySchema = z
	.object({
		identifier: z.string().trim().min(3).max(120),
		code: z.string().regex(/^\d{6}$/),
		newPassword: z.string().min(8).max(120),
	})
	.strict();
