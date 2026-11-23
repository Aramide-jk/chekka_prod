"use client";

import Link from "next/link";
import { type FormEvent, useContext, useState } from "react";
import { Button, Icon, Spinner } from "@/components";
import {
	DEMO_ACCOUNTS,
	type IDemoAccount,
	api,
	getErrorMessage,
} from "@/constants";
import { AppContextProvider } from "@/hooks";
import AuthShell from "../AuthShell";
import Field from "../Field";
import {
	DemoSectionStyled,
	DividerStyled,
	ErrorBoxStyled,
	RowStyled,
} from "./styled";

const POST_LOGIN_PATH_BY_ROLE: Record<string, string> = {
	buyer: "/dashboard",
	inspector: "/inspector/dashboard",
	consultant: "/consultant/chats",
	admin: "/admin",
	manager: "/admin",
};

export default function LoginWrapper() {
	const { setUser } = useContext(AppContextProvider);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [demoRoleBusy, setDemoRoleBusy] = useState<string | null>(null);

	async function executeLogin(targetEmail: string, targetPass: string) {
		setError(null);
		setBusy(true);
		try {
			const res = await api().post("/api/auth/login", {
				email: targetEmail,
				password: targetPass,
			});
			const user = res.data?.data?.user;
			if (user) setUser(user);
			const roleHome =
				POST_LOGIN_PATH_BY_ROLE[user?.role as string] ?? "/dashboard";
			const next = new URLSearchParams(window.location.search).get(
				"next",
			);
			// Only allow same-origin paths through `next` to avoid open redirects.
			const safeNext =
				next?.startsWith("/") && !next.startsWith("//") ? next : null;
			window.location.assign(safeNext ?? roleHome);
		} catch (err) {
			setError(getErrorMessage(err));
			setBusy(false);
			setDemoRoleBusy(null);
		}
	}

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (busy) return;
		await executeLogin(email, password);
	}

	async function handleInstantDemoLogin(account: IDemoAccount) {
		if (busy) return;
		setEmail(account.email);
		setPassword(account.password);
		setDemoRoleBusy(account.role);
		await executeLogin(account.email, account.password);
	}

	return (
		<AuthShell
			eyebrow="Welcome back"
			title="Sign in to"
			titleEm="Chekka"
			subtitle="Pick up where you left off — your inspections, reports, and chats are waiting."
			footer={
				<>
					New to Chekka? <Link href="/onboarding">Get started</Link>
				</>
			}
		>
			<form onSubmit={handleSubmit} data-testid="login-form">
				{error && <ErrorBoxStyled role="alert">{error}</ErrorBoxStyled>}

				<DemoSectionStyled data-testid="demo-access-panel">
					<div className="demo-header">
						<Icon name="shield-check" size={14} />
						<span>Recruiter Demo Access (1-Click Login)</span>
					</div>
					<div className="demo-grid">
						{DEMO_ACCOUNTS.map((acc) => {
							const isThisRole = demoRoleBusy === acc.role;
							return (
								<button
									key={acc.role}
									type="button"
									className="demo-btn"
									disabled={busy}
									onClick={() => handleInstantDemoLogin(acc)}
								>
									<span className="btn-title">
										<span>{acc.label}</span>
									</span>
									{isThisRole ? (
										<Spinner size={14} />
									) : (
										<Icon name="chevron-right" size={12} />
									)}
								</button>
							);
						})}
					</div>
				</DemoSectionStyled>

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
					label="Password"
					name="password"
					type="password"
					placeholder="••••••••"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					autoComplete="current-password"
					required
				/>
				<RowStyled>
					<span></span>
					<Link href="/forgot-password">Forgot your password?</Link>
				</RowStyled>
				<Button
					type="submit"
					variant="primary"
					size="lg"
					fullWidth
					disabled={busy}
				>
					{demoRoleBusy
						? `Signing in as ${demoRoleBusy}…`
						: busy
						? "Signing in…"
						: "Sign in"}
				</Button>
				<DividerStyled>or</DividerStyled>
				<Button
					type="button"
					variant="secondary"
					size="lg"
					fullWidth
					icon="user"
					disabled
				>
					Continue with Google
				</Button>
			</form>
		</AuthShell>
	);
}
