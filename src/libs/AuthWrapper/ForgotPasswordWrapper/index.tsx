"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { Button } from "@/components";
import { api, getErrorMessage } from "@/constants";
import AuthShell from "../AuthShell";
import Field from "../Field";
import {
	ErrorBoxStyled,
	InfoBoxStyled,
	RowStyled,
	SuccessBoxStyled,
} from "./styled";

export default function ForgotPasswordWrapper() {
	const [step, setStep] = useState<"request" | "reset" | "success">("request");
	const [identifier, setIdentifier] = useState("");
	const [code, setCode] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [resending, setResending] = useState(false);

	async function handleRequest(e: FormEvent) {
		e.preventDefault();
		if (busy) return;
		setError(null);
		setBusy(true);
		try {
			await api().post("/api/auth/forgot-password", {
				identifier: identifier.trim(),
			});
			setStep("reset");
		} catch (err) {
			setError(getErrorMessage(err, "Could not send reset code"));
		} finally {
			setBusy(false);
		}
	}

	async function handleResend() {
		if (resending || !identifier.trim()) return;
		setResending(true);
		setError(null);
		try {
			await api().post("/api/auth/forgot-password", {
				identifier: identifier.trim(),
			});
		} catch (err) {
			setError(getErrorMessage(err, "Could not resend code"));
		} finally {
			setResending(false);
		}
	}

	async function handleReset(e: FormEvent) {
		e.preventDefault();
		if (busy) return;
		setError(null);

		if (!/^\d{6}$/.test(code.trim())) {
			setError("Please enter the 6-digit code sent to you.");
			return;
		}

		if (newPassword.length < 8) {
			setError("Password must be at least 8 characters.");
			return;
		}

		if (newPassword !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		setBusy(true);
		try {
			await api().post("/api/auth/reset-password", {
				identifier: identifier.trim(),
				code: code.trim(),
				newPassword,
			});
			setStep("success");
		} catch (err) {
			setError(getErrorMessage(err, "Could not reset password"));
		} finally {
			setBusy(false);
		}
	}

	return (
		<AuthShell
			eyebrow="Recover access"
			title={step === "reset" ? "Enter your" : "Forgot your"}
			titleEm={step === "reset" ? "new password" : "password?"}
			subtitle={
				step === "reset"
					? "Enter the 6-digit code sent to your email or phone, then choose your new password."
					: step === "success"
						? "Your password has been updated. You can now sign in with your new credentials."
						: "Enter the email or phone tied to your account. We'll send a 6-digit code valid for 10 minutes."
			}
			footer={
				<>
					Remembered it? <Link href="/login">Back to sign in</Link>
				</>
			}
		>
			{step === "request" && (
				<form onSubmit={handleRequest} data-testid="forgot-password-form">
					{error && (
						<ErrorBoxStyled role="alert">{error}</ErrorBoxStyled>
					)}
					<Field
						label="Email or phone"
						name="identifier"
						placeholder="you@example.com or +2348012345678"
						value={identifier}
						onChange={(e) => setIdentifier(e.target.value)}
						required
					/>
					<Button
						type="submit"
						variant="primary"
						size="lg"
						fullWidth
						disabled={busy || !identifier.trim()}
					>
						{busy ? "Sending…" : "Send reset code"}
					</Button>
				</form>
			)}

			{step === "reset" && (
				<form onSubmit={handleReset} data-testid="reset-password-form">
					{error && (
						<ErrorBoxStyled role="alert">{error}</ErrorBoxStyled>
					)}
					<InfoBoxStyled>
						Code sent to <strong>{identifier}</strong>. It expires
						in 10 minutes.
					</InfoBoxStyled>
					<Field
						label="6-digit reset code"
						name="code"
						placeholder="123456"
						value={code}
						onChange={(e) => setCode(e.target.value)}
						maxLength={6}
						required
					/>
					<Field
						label="New password"
						name="newPassword"
						type="password"
						placeholder="At least 8 characters"
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						required
					/>
					<Field
						label="Confirm new password"
						name="confirmPassword"
						type="password"
						placeholder="Repeat new password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
					/>
					<Button
						type="submit"
						variant="primary"
						size="lg"
						fullWidth
						disabled={busy}
					>
						{busy ? "Updating password…" : "Reset password"}
					</Button>
					<RowStyled>
						<button
							type="button"
							onClick={handleResend}
							disabled={resending}
						>
							{resending ? "Resending code…" : "Didn't get a code? Resend"}
						</button>
						<button
							type="button"
							onClick={() => {
								setStep("request");
								setError(null);
							}}
						>
							Change email/phone
						</button>
					</RowStyled>
				</form>
			)}

			{step === "success" && (
				<div>
					<SuccessBoxStyled role="status">
						Your password has been successfully reset!
					</SuccessBoxStyled>
					<Link href="/login">
						<Button variant="primary" size="lg" fullWidth>
							Sign in now
						</Button>
					</Link>
				</div>
			)}
		</AuthShell>
	);
}
