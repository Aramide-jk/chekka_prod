"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Button, Pill } from "@/components";
import { api, fetcher, getErrorMessage } from "@/constants";
import AuthShell from "../AuthWrapper/AuthShell";
import Field from "../AuthWrapper/Field";
import { ButtonRowStyled, ErrorBoxStyled, InfoBoxStyled } from "./styled";

interface IInvitePreview {
	email: string;
	fullName: string;
	expiresAt: string; // ISO
	openable: boolean;
}

function fmtRemaining(iso?: string): string {
	if (!iso) return "—";
	const ms = new Date(iso).getTime() - Date.now();
	if (ms <= 0) return "expired";
	const hours = Math.floor(ms / 3_600_000);
	if (hours >= 24) return `${Math.floor(hours / 24)} day(s)`;
	if (hours >= 1) return `${hours} hour(s)`;
	return "less than an hour";
}

export default function InviteWrapper({ token }: { token: string }) {
	const [preview, setPreview] = useState<IInvitePreview | null>(null);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [doneState, setDoneState] = useState<"accepted" | "rejected" | null>(
		null,
	);

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		fetcher<{ data?: { invite?: IInvitePreview } }>(
			`/api/auth/invites/${token}`,
		)
			.then((body) => {
				if (cancelled) return;
				const invite = body?.data?.invite ?? null;
				setPreview(invite);
				setLoadError(invite ? null : "Invite not found.");
			})
			.catch((err) => {
				if (cancelled) return;
				setLoadError(getErrorMessage(err, "Invite not found."));
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [token]);

	async function accept(e: FormEvent) {
		e.preventDefault();
		if (busy) return;
		if (password.length < 8) {
			setError("Password must be at least 8 characters.");
			return;
		}
		if (password !== confirm) {
			setError("Passwords don't match.");
			return;
		}
		setBusy(true);
		setError(null);
		try {
			await api().post(`/api/auth/invites/${token}/accept`, { password });
			setDoneState("accepted");
			// Hand off to the admin shell — the manager is signed in now.
			window.location.assign("/admin");
		} catch (err) {
			setError(getErrorMessage(err, "Could not accept invite"));
			setBusy(false);
		}
	}

	async function decline() {
		if (busy) return;
		setBusy(true);
		setError(null);
		try {
			await api().post(`/api/auth/invites/${token}/reject`);
			setDoneState("rejected");
		} catch (err) {
			setError(getErrorMessage(err, "Could not decline invite"));
		} finally {
			setBusy(false);
		}
	}

	if (loading) {
		return (
			<AuthShell
				eyebrow="Invite"
				title="Checking your"
				titleEm="invite…"
				subtitle="One moment — looking up the invite that was sent to you."
			>
				<div data-testid="invite-loading">Loading…</div>
			</AuthShell>
		);
	}

	if (!preview || loadError) {
		return (
			<AuthShell
				eyebrow="Invite"
				title="This invite"
				titleEm="isn't valid"
				subtitle="The link may have been mistyped or already used. Ask the admin who invited you to resend it."
			>
				<ErrorBoxStyled data-testid="invite-error" role="alert">
					{loadError ?? "Invite not found."}
				</ErrorBoxStyled>
			</AuthShell>
		);
	}

	if (!preview.openable) {
		return (
			<AuthShell
				eyebrow="Invite"
				title="This invite has"
				titleEm="been closed"
				subtitle="It was either accepted, declined, or expired. Ask the admin to send a fresh invite if you still need access."
			>
				<InfoBoxStyled data-testid="invite-closed">
					Status: closed (link expired or already consumed).
				</InfoBoxStyled>
			</AuthShell>
		);
	}

	if (doneState === "rejected") {
		return (
			<AuthShell
				eyebrow="Invite"
				title="Invite"
				titleEm="declined"
				subtitle="No worries — we won't bother you again. If this was a mistake, ask the admin to resend the invite."
			>
				<InfoBoxStyled data-testid="invite-rejected">
					You declined this invite. You can safely close this tab.
				</InfoBoxStyled>
			</AuthShell>
		);
	}

	return (
		<AuthShell
			eyebrow="Manager invite"
			title="Welcome,"
			titleEm={preview.fullName.split(" ")[0] || "manager"}
			subtitle={`An admin invited ${preview.email} to manage parts of the Chekka platform. Set a password to accept.`}
		>
			<form onSubmit={accept} data-testid="invite-form">
				<InfoBoxStyled className="compact">
					<div className="pill-row">
						<Pill tone="gold">
							Expires in {fmtRemaining(preview.expiresAt)}
						</Pill>
					</div>
					Account: <strong>{preview.email}</strong>
				</InfoBoxStyled>
				{error && (
					<ErrorBoxStyled
						role="alert"
						data-testid="invite-form-error"
					>
						{error}
					</ErrorBoxStyled>
				)}
				<Field
					label="Choose a password"
					name="password"
					type="password"
					placeholder="At least 8 characters"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					autoComplete="new-password"
					required
					minLength={8}
					data-testid="invite-password"
				/>
				<Field
					label="Confirm password"
					name="confirm"
					type="password"
					placeholder="Type it again"
					value={confirm}
					onChange={(e) => setConfirm(e.target.value)}
					autoComplete="new-password"
					required
					minLength={8}
					data-testid="invite-confirm"
				/>
				<Button
					type="submit"
					variant="primary"
					size="lg"
					fullWidth
					disabled={busy}
					data-testid="invite-accept"
				>
					{busy ? "Accepting…" : "Accept and sign in"}
				</Button>
				<ButtonRowStyled>
					<Button
						type="button"
						variant="ghost"
						size="md"
						disabled={busy}
						onClick={decline}
						data-testid="invite-decline"
					>
						Decline this invite
					</Button>
				</ButtonRowStyled>
			</form>
		</AuthShell>
	);
}
