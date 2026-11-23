import type { FullConfig } from "@playwright/test";

// Next dev compiles route handlers on-demand on their first request. When the
// suite (single worker, no retries) floods a freshly-started dev server, those
// first hits race the compiler and can transiently 404 / time out — which then
// cascades into mass `loginOrSkip` skips. Warming every page + API route once,
// after the webServer is up but before any test runs, makes the run
// deterministic. Each request is fire-and-forget; status codes don't matter
// (401/404/405 all still compile the module).
const PORT = Number(process.env.E2E_PORT ?? 3300);
const BASE_URL = `http://127.0.0.1:${PORT}`;

const PAGE_ROUTES = [
	"/",
	"/login",
	"/signup",
	"/forgot-password",
	"/onboarding",
	"/dashboard",
	"/book",
	"/book/1",
	"/inspections/x",
	"/inspections/x/live",
	"/chat",
	"/sample-report",
	"/inspectors",
	"/settings",
	"/inspector",
	"/inspector/apply",
	"/inspector/dashboard",
	"/inspector/schedule",
	"/inspector/earnings",
	"/inspector/pending",
	"/inspector/rejected",
	"/inspector/suspended",
	"/inspector/inspections/x",
	"/inspector/inspections/x/report",
	"/inspector/inspections/x/live",
	"/admin",
	"/admin/special-requests",
	"/admin/inspections",
	"/admin/inspections/live",
	"/admin/disputes",
	"/admin/broker-requests",
	"/admin/overdue",
	"/admin/audit-logs",
	"/admin/settings",
	"/admin/managers",
	"/admin/inspectors",
	"/consultant/chats",
	"/terms",
	"/privacy",
	"/invite/x",
	"/share/x",
];

const API_ROUTES = [
	"/api/health",
	"/api/site-config",
	"/api/auth/session",
	"/api/auth/login",
	"/api/auth/logout",
	"/api/auth/signup",
	"/api/auth/forgot-password",
	"/api/auth/reset-password",
	"/api/auth/invites/x",
	"/api/auth/invites/x/accept",
	"/api/auth/invites/x/reject",
	"/api/users/me",
	"/api/users/me/avatar",
	"/api/dashboard/buyer",
	"/api/dashboard/inspector",
	"/api/inspections",
	"/api/inspections/x",
	"/api/inspections/x/report",
	"/api/inspections/x/report-pdf",
	"/api/inspections/x/photos",
	"/api/inspections/x/rating",
	"/api/inspections/x/live",
	"/api/inspections/x/share",
	"/api/inspections/reports-pdf",
	"/api/inspectors",
	"/api/inspectors/x/availability",
	"/api/inspector-profiles/me",
	"/api/inspector-profiles/apply",
	"/api/inspector-profiles/schedule",
	"/api/inspector-profiles/availability",
	"/api/transactions/initialize",
	"/api/transactions/verify",
	"/api/webhooks/paystack",
	"/api/transactions/earnings",
	"/api/notifications",
	"/api/notifications/x/read",
	"/api/notifications/read-all",
	"/api/chats",
	"/api/chats/x/messages",
	"/api/chats/x/escalate",
	"/api/disputes",
	"/api/broker-requests",
	"/api/mock-asset",
	"/api/admin/counts",
	"/api/admin/audit-logs",
	"/api/admin/site-config",
	"/api/admin/managers",
	"/api/admin/managers/x",
	"/api/admin/managers/x/resend-invite",
	"/api/admin/special-requests",
	"/api/admin/special-requests/x/assign",
	"/api/admin/inspections",
	"/api/admin/inspections/live",
	"/api/admin/inspections/x/cancel",
	"/api/admin/inspections/x/reassign",
	"/api/admin/inspections/x/remind",
	"/api/admin/disputes",
	"/api/admin/disputes/x/resolve",
	"/api/admin/broker-requests",
	"/api/admin/broker-requests/x/assign",
	"/api/admin/inspectors",
	"/api/admin/inspectors/x",
	"/api/admin/inspectors/x/certificate",
];

async function hit(path: string): Promise<void> {
	try {
		await fetch(`${BASE_URL}${path}`, {
			redirect: "manual",
			signal: AbortSignal.timeout(3_000),
		});
	} catch {
		// Server may still be settling on the very first hit — ignore; the route
		// is being compiled regardless.
	}
}

async function warmInBatches(
	paths: string[],
	batchSize: number,
): Promise<void> {
	for (let i = 0; i < paths.length; i += batchSize) {
		await Promise.all(paths.slice(i, i + batchSize).map(hit));
	}
}

export default async function globalSetup(_config: FullConfig): Promise<void> {
	// Pages first (they pull in the proxy + shared chunks), then API routes.
	// Small concurrent batches keep the compiler busy without opening dozens of
	// sockets at once (which trips Node's MaxListeners warning).
	await warmInBatches(PAGE_ROUTES, 6);
	await warmInBatches(API_ROUTES, 6);
}
