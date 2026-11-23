"use client";

import Link from "next/link";
import { type FormEvent, useContext, useState } from "react";
import { Button } from "@/components";
import { api, getErrorMessage } from "@/constants";
import { AppContextProvider } from "@/hooks";
import AuthShell from "../AuthShell";
import Field from "../Field";
import {
	AgreeStyled,
	ErrorBoxStyled,
	GridStyled,
	LinkButtonStyled,
	ResendRowStyled,
	RoleButtonStyled,
	RoleHintStyled,
	RoleRowStyled,
	VerifyLedeStyled,
} from "./styled";

// Email verification is issued and validated by the server.
// It confirms the address can receive mail before the account is created.
export default function SignupWrapper() {
	const { setUser } = useContext(AppContextProvider);
	const [fullName, setFullName] = useState("");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [role, setRole] = useState<"buyer" | "inspector">("buyer");
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	// Email-verification gate.
	const [phase, setPhase] = useState<"form" | "verify">("form");
	const [enteredCode, setEnteredCode] = useState("");
	const [verifyError, setVerifyError] = useState<string | null>(null);
	const [resending, setResending] = useState(false);

	async function requestVerificationEmail(): Promise<void> {
		await api().post("/api/auth/signup/verification", {
			email,
			fullName,
		});
	}

	// Create the account for real, then route the new user to where they work
	// from: inspectors complete their profile + documents; buyers land on the
	// dashboard. (Onboarding runs before signup, so it isn't replayed here.)
	async function createAccount() {
		setBusy(true);
		setError(null);
		try {
			const res = await api().post("/api/auth/signup", {
				fullName,
				username,
				email,
				phone,
				password,
				role,
				verificationCode: enteredCode.trim(),
			});
			const user = res.data?.data?.user;
			if (user) setUser(user);
			window.location.assign(
				role === "inspector" ? "/inspector/apply" : "/dashboard",
			);
		} catch (err) {
			setError(getErrorMessage(err));
			setBusy(false);
			setPhase("form");
		}
	}

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (busy) return;
		setError(null);
		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}
		setBusy(true);
		try {
			await requestVerificationEmail();
			setEnteredCode("");
			setVerifyError(null);
			setPhase("verify");
		} catch (err) {
			setError(getErrorMessage(err, "Could not send verification code"));
		}
		setBusy(false);
	}

	async function handleVerify(e: FormEvent) {
		e.preventDefault();
		if (busy) return;
		if (!/^\d{6}$/.test(enteredCode.trim())) {
			setVerifyError(
				"That code doesn't match. Check your email and try again.",
			);
			return;
		}
		setVerifyError(null);
		await createAccount();
	}

	async function handleResend() {
		if (resending) return;
		setResending(true);
		setVerifyError(null);
		try {
			await requestVerificationEmail();
		} catch {
			setVerifyError("Couldn't resend the code. Please try again.");
		}
		setResending(false);
	}

	if (phase === "verify") {
		return (
			<AuthShell
				eyebrow="Verify your email"
				title="Check your"
				titleEm="inbox"
				subtitle="We sent a 6-digit code to confirm your email address."
				footer={
					<>
						Wrong address?{" "}
						<LinkButtonStyled
							type="button"
							onClick={() => setPhase("form")}
						>
							Go back
						</LinkButtonStyled>
					</>
				}
			>
				<form onSubmit={handleVerify} data-testid="verify-form">
					{verifyError && (
						<ErrorBoxStyled role="alert">
							{verifyError}
						</ErrorBoxStyled>
					)}
					<VerifyLedeStyled>
						Enter the code we emailed to <strong>{email}</strong>.
					</VerifyLedeStyled>
					<Field
						label="Verification code"
						name="code"
						inputMode="numeric"
						placeholder="123456"
						value={enteredCode}
						onChange={(e) => setEnteredCode(e.target.value)}
						autoComplete="one-time-code"
						maxLength={6}
						required
					/>
					<Button
						type="submit"
						variant="primary"
						size="lg"
						fullWidth
						disabled={busy}
					>
						{busy ? "Verifying…" : "Verify & create account"}
					</Button>
					<ResendRowStyled>
						Didn't get it?{" "}
						<button
							type="button"
							onClick={handleResend}
							disabled={resending}
						>
							{resending ? "Sending…" : "Resend code"}
						</button>
					</ResendRowStyled>
				</form>
			</AuthShell>
		);
	}

	return (
		<AuthShell
			eyebrow="Create your account"
			title="Start with"
			titleEm="Chekka"
			subtitle="A few details and you can book your first certified inspection in minutes."
			footer={
				<>
					Already have an account? <Link href="/login">Sign in</Link>
				</>
			}
		>
			<form onSubmit={handleSubmit} data-testid="signup-form">
				{error && <ErrorBoxStyled role="alert">{error}</ErrorBoxStyled>}
				<RoleRowStyled role="tablist" aria-label="Account type">
					<RoleButtonStyled
						type="button"
						role="tab"
						aria-selected={role === "buyer"}
						$on={role === "buyer"}
						onClick={() => setRole("buyer")}
					>
						I'm a buyer
					</RoleButtonStyled>
					<RoleButtonStyled
						type="button"
						role="tab"
						aria-selected={role === "inspector"}
						$on={role === "inspector"}
						onClick={() => setRole("inspector")}
					>
						I'm an inspector
					</RoleButtonStyled>
				</RoleRowStyled>
				<RoleHintStyled>
					{role === "inspector"
						? "After signup you'll complete your profile and upload documents. You can take jobs once Chekka verifies your account."
						: "Book and track certified inspections in minutes."}
				</RoleHintStyled>
				<GridStyled>
					<Field
						label="Full name"
						name="fullName"
						placeholder="Ada Lovelace"
						value={fullName}
						onChange={(e) => setFullName(e.target.value)}
						autoComplete="name"
						required
					/>
					<Field
						label="Username"
						name="username"
						placeholder="ada"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						autoComplete="username"
						required
						minLength={2}
					/>
				</GridStyled>
				<Field
					label="Email"
					name="email"
					type="email"
					placeholder="you@example.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					autoComplete="email"
					required
				/>
				<Field
					label="Phone"
					name="phone"
					type="tel"
					placeholder="+2348012345678"
					value={phone}
					onChange={(e) => setPhone(e.target.value)}
					autoComplete="tel"
					required
				/>
				<Field
					label="Password"
					name="password"
					type="password"
					placeholder="At least 8 characters"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					autoComplete="new-password"
					required
					minLength={8}
				/>
				<Field
					label="Confirm password"
					name="confirmPassword"
					type="password"
					placeholder="Re-enter your password"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
					autoComplete="new-password"
					required
					minLength={8}
				/>
				<AgreeStyled>
					By creating an account you agree to our{" "}
					<Link href="/terms">Terms</Link> and{" "}
					<Link href="/privacy">Privacy Policy</Link>.
				</AgreeStyled>
				<Button
					type="submit"
					variant="primary"
					size="lg"
					fullWidth
					disabled={busy}
				>
					{busy ? "Creating…" : "Create account"}
				</Button>
			</form>
		</AuthShell>
	);
}
