"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Avatar, Button, Eyebrow, Icon, Pill } from "@/components";
import { api, fetcher, getErrorMessage } from "@/constants";
import { PageShell } from "@/layouts";
import type { IResponseEnvelope } from "@/types";
import {
	BackdropStyled,
	BarFillStyled,
	BarStyled,
	CardHeadStyled,
	CardNamesStyled,
	ChipRowStyled,
	ChipStyled,
	CloseButtonStyled,
	DirtyStatusStyled,
	EmailLineStyled,
	EmptyStateStyled,
	EmptyTitleStyled,
	ErrorBoxStyled,
	FieldLabelStyled,
	FieldStyled,
	FilterBarStyled,
	FilterChipStyled,
	FilterChipsStyled,
	FullWidthInputStyled,
	GridStyled,
	HeaderActionsStyled,
	InputStyled,
	ManagerCardStyled,
	ModalBodyStyled,
	ModalFooterRightStyled,
	ModalFooterStyled,
	ModalHeadStyled,
	ModalShellStyled,
	ModalTitleStyled,
	MutedChipStyled,
	NameLineStyled,
	PageBtnStyled,
	PageControlsStyled,
	PageInfoStyled,
	PaginationBarStyled,
	PermCountStyled,
	PermGroupHeadStyled,
	PermGroupHintStyled,
	PermGroupStyled,
	PermGroupTitleStyled,
	PermissionRowStyled,
	SearchBoxStyled,
	StatCardStyled,
	StatHeadStyled,
	StatIconStyled,
	StatLabelStyled,
	StatSubStyled,
	StatsRowStyled,
	StatValueStyled,
	ToggleStyled,
	TotalChipStyled,
	TotalLabelStyled,
	TotalNumberStyled,
} from "./styled";

// Permissions catalogue (mirrored from the server). Grouped here so the
// detail modal can render them as logical sections instead of a flat list —
// makes a long permission set scannable at a glance.
interface PermissionGroup {
	label: string;
	hint: string;
	items: Array<{ key: string; label: string }>;
}
const PERMISSION_GROUPS: PermissionGroup[] = [
	{
		label: "Inspectors",
		hint: "Reviewing and approving inspector applications.",
		items: [
			{ key: "inspectors.view", label: "View inspector applications" },
			{ key: "inspectors.approve", label: "Approve / reject inspectors" },
		],
	},
	{
		label: "Operations",
		hint: "Day-to-day inspection queues and dispute handling.",
		items: [
			{ key: "live.view", label: "View live inspections" },
			{ key: "overdue.view", label: "View overdue reports" },
			{ key: "special_requests.view", label: "View special requests" },
			{ key: "broker_requests.view", label: "View broker requests" },
			{ key: "disputes.view", label: "View disputes" },
			{ key: "disputes.resolve", label: "Resolve disputes" },
		],
	},
	{
		label: "Configuration",
		hint: "Site-wide settings that shape the rest of the platform.",
		items: [
			{ key: "site_config.view", label: "View site settings" },
			{ key: "site_config.edit", label: "Edit site settings" },
		],
	},
	{
		label: "Audit",
		hint: "Read access to the admin audit trail.",
		items: [{ key: "audit.view", label: "View audit log" }],
	},
];

const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap((g) =>
	g.items.map((i) => i.key),
);

const PERMISSION_LABEL_BY_KEY = Object.fromEntries(
	PERMISSION_GROUPS.flatMap((g) =>
		g.items.map((i) => [i.key, i.label] as const),
	),
) as Record<string, string>;

const PAGE_SIZE = 9; // 3 × 3 grid on desktop — keeps the layout tidy.

type StatusFilter = "all" | "active" | "suspended" | "pending" | "rejected";

const STATUS_FILTERS: Array<{
	value: StatusFilter;
	label: string;
}> = [
	{ value: "all", label: "All" },
	{ value: "active", label: "Active" },
	{ value: "suspended", label: "Suspended" },
	{ value: "pending", label: "Pending" },
	{ value: "rejected", label: "Rejected" },
];

interface IManager {
	id: string;
	fullName: string;
	username: string;
	email: string;
	phone?: string;
	status: "active" | "pending" | "approved" | "rejected" | "suspended";
	permissions: string[];
	// Invite lifecycle. `inviteToken` is NEVER on this shape — it's returned
	// only once when the admin creates/resends the invite. The flags below
	// drive the "pending" badge and the "permissions locked" affordance.
	invitedAt?: string;
	inviteTokenExpiresAt?: string;
	inviteAcceptedAt?: string;
	inviteRejectedAt?: string;
	hasOutstandingInvite?: boolean;
	createdAt: string;
	updatedAt: string;
}

interface IIssuedInvite {
	token: string;
	path: string;
	expiresAt: string;
}

// ─── State helpers ───────────────────────────────────────────────────────────

interface IInviteForm {
	fullName: string;
	username: string;
	email: string;
	phone: string;
}
const EMPTY_INVITE: IInviteForm = {
	fullName: "",
	username: "",
	email: "",
	phone: "",
};

function statusTone(
	s: IManager["status"],
): "good" | "danger" | "ghost" | "caution" {
	if (s === "active" || s === "approved") return "good";
	if (s === "suspended") return "danger";
	if (s === "pending") return "caution";
	return "ghost";
}

function matchesStatusFilter(s: IManager["status"], f: StatusFilter): boolean {
	if (f === "all") return true;
	if (f === "active") return s === "active" || s === "approved";
	return s === f;
}

// ─── Top-level component ─────────────────────────────────────────────────────

export default function ManagersWrapper() {
	const { data, mutate, isLoading } = useSWR<
		IResponseEnvelope<{ managers: IManager[] }>
	>("/api/admin/managers", fetcher, { revalidateOnMount: true });
	const managers = data?.data?.managers ?? [];

	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [page, setPage] = useState(1);

	// Reset to first page whenever the filter/search shrinks the result set,
	// otherwise the user can land on an empty page after typing.
	//
	// We use React's recommended "reset state on prop change" pattern
	// (https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes)
	// rather than a useEffect — biome's `useExhaustiveDependencies` rule kept
	// stripping `[query, statusFilter]` to `[]` because the effect body
	// doesn't read them, which broke the reset AND triggered React's runtime
	// "deps array changed size between renders" warning under HMR.
	const filterKey = `${query}::${statusFilter}`;
	const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
	if (prevFilterKey !== filterKey) {
		setPrevFilterKey(filterKey);
		setPage(1);
	}

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return managers.filter((m) => {
			if (!matchesStatusFilter(m.status, statusFilter)) return false;
			if (!q) return true;
			return (
				m.fullName.toLowerCase().includes(q) ||
				m.email.toLowerCase().includes(q) ||
				m.username.toLowerCase().includes(q)
			);
		});
	}, [managers, query, statusFilter]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const safePage = Math.min(page, totalPages);
	const pageStart = (safePage - 1) * PAGE_SIZE;
	const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

	const stats = useMemo(() => {
		const total = managers.length;
		const active = managers.filter(
			(m) => m.status === "active" || m.status === "approved",
		).length;
		const suspended = managers.filter(
			(m) => m.status === "suspended",
		).length;
		const avg =
			total === 0
				? 0
				: Math.round(
						managers.reduce((s, m) => s + m.permissions.length, 0) /
							total,
					);
		return { total, active, suspended, avg };
	}, [managers]);

	const statusCounts = useMemo(() => {
		const counts: Record<StatusFilter, number> = {
			all: managers.length,
			active: 0,
			suspended: 0,
			pending: 0,
			rejected: 0,
		};
		for (const m of managers) {
			if (m.status === "active" || m.status === "approved")
				counts.active++;
			else if (m.status === "suspended") counts.suspended++;
			else if (m.status === "pending") counts.pending++;
			else if (m.status === "rejected") counts.rejected++;
		}
		return counts;
	}, [managers]);

	const [showInvite, setShowInvite] = useState(false);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const selected = useMemo(
		() => managers.find((m) => m.id === selectedId) ?? null,
		[managers, selectedId],
	);

	return (
		<PageShell
			eyebrow="Admin · Delegation"
			title="Manager"
			titleEm="accounts"
			navTitle="Managers"
			subtitle="Invite teammates and grant them ONLY the slices of admin they need. New managers default to zero access."
			right={
				<HeaderActionsStyled>
					<TotalChipStyled>
						<TotalNumberStyled>{managers.length}</TotalNumberStyled>
						<TotalLabelStyled>total</TotalLabelStyled>
					</TotalChipStyled>
					<Button
						variant="primary"
						size="md"
						icon="plus"
						onClick={() => setShowInvite(true)}
						data-testid="manager-invite"
					>
						Invite manager
					</Button>
				</HeaderActionsStyled>
			}
		>
			<div data-testid="managers-page">
				<StatsRowStyled data-testid="managers-stats">
					<StatCardStyled $accent="var(--gold)">
						<StatHeadStyled>
							<StatLabelStyled>Total managers</StatLabelStyled>
							<StatIconStyled $tone="gold">
								<Icon name="users" size={14} />
							</StatIconStyled>
						</StatHeadStyled>
						<StatValueStyled>{stats.total}</StatValueStyled>
					</StatCardStyled>
					<StatCardStyled $accent="var(--good)">
						<StatHeadStyled>
							<StatLabelStyled>Active</StatLabelStyled>
							<StatIconStyled $tone="good">
								<Icon name="check" size={14} />
							</StatIconStyled>
						</StatHeadStyled>
						<StatValueStyled>{stats.active}</StatValueStyled>
					</StatCardStyled>
					<StatCardStyled $accent="var(--danger)">
						<StatHeadStyled>
							<StatLabelStyled>Suspended</StatLabelStyled>
							<StatIconStyled $tone="danger">
								<Icon name="x" size={14} />
							</StatIconStyled>
						</StatHeadStyled>
						<StatValueStyled>{stats.suspended}</StatValueStyled>
					</StatCardStyled>
					<StatCardStyled $accent="var(--info)">
						<StatHeadStyled>
							<StatLabelStyled>Avg permissions</StatLabelStyled>
							<StatIconStyled $tone="info">
								<Icon name="shield-check" size={14} />
							</StatIconStyled>
						</StatHeadStyled>
						<StatValueStyled>
							{stats.avg}
							<StatSubStyled>
								/ {ALL_PERMISSION_KEYS.length}
							</StatSubStyled>
						</StatValueStyled>
					</StatCardStyled>
				</StatsRowStyled>

				<FilterBarStyled>
					<SearchBoxStyled>
						<Icon name="search" size={14} />
						<input
							placeholder="Search by name, email, or username…"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							data-testid="managers-search"
						/>
					</SearchBoxStyled>
					<FilterChipsStyled data-testid="managers-filter">
						{STATUS_FILTERS.map((f) => (
							<FilterChipStyled
								key={f.value}
								type="button"
								$on={statusFilter === f.value}
								onClick={() => setStatusFilter(f.value)}
								data-testid={`managers-filter-${f.value}`}
							>
								{f.label}
								<span className="chip-count">
									{statusCounts[f.value]}
								</span>
							</FilterChipStyled>
						))}
					</FilterChipsStyled>
				</FilterBarStyled>

				{isLoading && (
					<EmptyStateStyled>
						<EmptyTitleStyled>Loading…</EmptyTitleStyled>
					</EmptyStateStyled>
				)}

				{!isLoading && managers.length === 0 && (
					<EmptyStateStyled data-testid="managers-empty">
						<Icon name="users" size={32} />
						<EmptyTitleStyled>No managers yet</EmptyTitleStyled>
						<div>
							Invite teammates to delegate slices of the admin
							dashboard. New managers start with zero access.
						</div>
						<div className="empty-cta">
							<Button
								variant="primary"
								size="md"
								icon="plus"
								onClick={() => setShowInvite(true)}
							>
								Invite your first manager
							</Button>
						</div>
					</EmptyStateStyled>
				)}

				{!isLoading && managers.length > 0 && (
					<>
						<GridStyled data-testid="managers-list">
							{pageItems.map((m) => (
								<ManagerRoleCard
									key={m.id}
									manager={m}
									onClick={() => setSelectedId(m.id)}
								/>
							))}
						</GridStyled>

						{filtered.length === 0 && (
							<EmptyStateStyled data-testid="managers-no-match">
								<EmptyTitleStyled>No matches</EmptyTitleStyled>
								<div>
									Nothing matches your search or filter. Try
									clearing them.
								</div>
								<div className="empty-cta">
									<Button
										variant="secondary"
										size="sm"
										onClick={() => {
											setQuery("");
											setStatusFilter("all");
										}}
									>
										Clear filters
									</Button>
								</div>
							</EmptyStateStyled>
						)}

						{filtered.length > 0 && (
							<Pagination
								page={safePage}
								totalPages={totalPages}
								totalItems={filtered.length}
								pageSize={PAGE_SIZE}
								onPage={setPage}
							/>
						)}
					</>
				)}
			</div>

			{showInvite && (
				<InviteModal
					onClose={() => setShowInvite(false)}
					onCreated={(id) => {
						setShowInvite(false);
						mutate();
						setSelectedId(id);
					}}
				/>
			)}

			{selected && (
				<DetailModal
					manager={selected}
					onClose={() => setSelectedId(null)}
					onChanged={() => mutate()}
				/>
			)}
		</PageShell>
	);
}

// ─── Pagination ──────────────────────────────────────────────────────────────

function Pagination({
	page,
	totalPages,
	totalItems,
	pageSize,
	onPage,
}: {
	page: number;
	totalPages: number;
	totalItems: number;
	pageSize: number;
	onPage: (n: number) => void;
}) {
	const start = (page - 1) * pageSize + 1;
	const end = Math.min(page * pageSize, totalItems);

	// Compact page-number window so the bar doesn't grow unbounded for many
	// pages: always show first, last, current, and one neighbour either side.
	const visiblePages = useMemo(() => {
		const out = new Set<number>([1, totalPages, page, page - 1, page + 1]);
		return Array.from(out)
			.filter((n) => n >= 1 && n <= totalPages)
			.sort((a, b) => a - b);
	}, [page, totalPages]);

	return (
		<PaginationBarStyled data-testid="managers-pagination">
			<PageInfoStyled>
				Showing{" "}
				<strong className="pg-strong">
					{start}–{end}
				</strong>{" "}
				of <strong className="pg-strong">{totalItems}</strong> · Page{" "}
				{page} of {totalPages}
			</PageInfoStyled>
			<PageControlsStyled>
				<PageBtnStyled
					type="button"
					$disabled={page === 1}
					disabled={page === 1}
					onClick={() => onPage(page - 1)}
					data-testid="managers-page-prev"
				>
					<Icon name="chevron-left" size={12} /> Prev
				</PageBtnStyled>
				{visiblePages.map((n, i) => {
					const prev = visiblePages[i - 1];
					const gap = prev !== undefined && n - prev > 1;
					return (
						<span key={n} className="pg-num">
							{gap && <span className="pg-gap">…</span>}
							<PageBtnStyled
								type="button"
								$current={n === page}
								onClick={() => onPage(n)}
								data-testid={`managers-page-${n}`}
							>
								{n}
							</PageBtnStyled>
						</span>
					);
				})}
				<PageBtnStyled
					type="button"
					$disabled={page === totalPages}
					disabled={page === totalPages}
					onClick={() => onPage(page + 1)}
					data-testid="managers-page-next"
				>
					Next <Icon name="chevron-right" size={12} />
				</PageBtnStyled>
			</PageControlsStyled>
		</PaginationBarStyled>
	);
}

// ─── Manager card ────────────────────────────────────────────────────────────

function ManagerRoleCard({
	manager,
	onClick,
}: {
	manager: IManager;
	onClick: () => void;
}) {
	const total = ALL_PERMISSION_KEYS.length;
	const have = manager.permissions.length;
	const pct = total === 0 ? 0 : Math.round((have / total) * 100);
	const top = manager.permissions.slice(0, 3);
	const overflow = Math.max(0, manager.permissions.length - top.length);
	return (
		<ManagerCardStyled
			type="button"
			onClick={onClick}
			data-testid={`manager-row-${manager.email}`}
		>
			<CardHeadStyled>
				<Avatar name={manager.fullName} size={44} />
				<CardNamesStyled>
					<NameLineStyled>{manager.fullName}</NameLineStyled>
					<EmailLineStyled>{manager.email}</EmailLineStyled>
				</CardNamesStyled>
				<Pill tone={statusTone(manager.status)}>{manager.status}</Pill>
			</CardHeadStyled>

			<div>
				<PermCountStyled>
					<span>
						{have === 0
							? "No permissions yet"
							: `${have} / ${total} permission${have === 1 ? "" : "s"}`}
					</span>
					<span className="perm-pct">{pct}%</span>
				</PermCountStyled>
				<BarStyled className="perm-bar">
					<BarFillStyled $pct={pct} />
				</BarStyled>
			</div>

			<ChipRowStyled>
				{top.length === 0 && (
					<MutedChipStyled>
						Zero access — click to grant
					</MutedChipStyled>
				)}
				{top.map((p) => (
					<ChipStyled key={p}>
						{PERMISSION_LABEL_BY_KEY[p] ?? p}
					</ChipStyled>
				))}
				{overflow > 0 && (
					<MutedChipStyled>+{overflow} more</MutedChipStyled>
				)}
			</ChipRowStyled>
		</ManagerCardStyled>
	);
}

// ─── Invite modal ────────────────────────────────────────────────────────────

function InviteModal({
	onClose,
	onCreated,
}: {
	onClose: () => void;
	onCreated: (id: string) => void;
}) {
	const [form, setForm] = useState<IInviteForm>(EMPTY_INVITE);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	// Two-stage modal: form → issued-invite confirmation. Once the invite is
	// minted we surface the one-shot URL the admin can copy/paste so they can
	// hand it to the manager out-of-band (until the email path is wired up).
	const [issued, setIssued] = useState<{
		manager: IManager;
		invite: IIssuedInvite;
	} | null>(null);
	const [copied, setCopied] = useState(false);

	useEscapeKey(onClose);

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		if (submitting) return;
		setSubmitting(true);
		setError(null);
		try {
			const res = await api().post("/api/admin/managers", {
				fullName: form.fullName,
				username: form.username,
				email: form.email,
				phone: form.phone || undefined,
				// Default: zero permissions. The admin grants them via the
				// detail modal AFTER the manager accepts the invite — the
				// server refuses grants on pending rows.
				permissions: [],
			});
			const data = res.data?.data;
			const manager: IManager | undefined = data?.manager;
			const invite: IIssuedInvite | undefined = data?.invite;
			if (manager && invite) {
				setIssued({ manager, invite });
			} else {
				onClose();
			}
		} catch (err) {
			setError(getErrorMessage(err, "Could not create manager"));
		} finally {
			setSubmitting(false);
		}
	}

	async function copyLink() {
		if (!issued) return;
		const fullUrl = new URL(
			issued.invite.path,
			window.location.origin,
		).toString();
		try {
			await navigator.clipboard.writeText(fullUrl);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			// Clipboard may be unavailable (insecure context, denied perms);
			// the input is still selectable so the admin can copy manually.
		}
	}

	return (
		<BackdropStyled
			role="dialog"
			aria-modal="true"
			aria-labelledby="invite-modal-title"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
			data-testid="invite-modal"
		>
			<ModalShellStyled>
				{!issued && (
					<form onSubmit={submit}>
						<ModalHeadStyled>
							<div>
								<Eyebrow $gold className="modal-eyebrow">
									Invite
								</Eyebrow>
								<ModalTitleStyled id="invite-modal-title">
									Add a manager
								</ModalTitleStyled>
							</div>
							<CloseButtonStyled
								type="button"
								onClick={onClose}
								aria-label="Close"
							>
								<Icon name="x" size={16} />
							</CloseButtonStyled>
						</ModalHeadStyled>
						<ModalBodyStyled>
							<FieldStyled>
								<FieldLabelStyled htmlFor="m-fullname">
									Full name
								</FieldLabelStyled>
								<InputStyled
									id="m-fullname"
									required
									value={form.fullName}
									data-testid="invite-fullname"
									onChange={(e) =>
										setForm((s) => ({
											...s,
											fullName: e.target.value,
										}))
									}
								/>
							</FieldStyled>
							<FieldStyled>
								<FieldLabelStyled htmlFor="m-username">
									Username
								</FieldLabelStyled>
								<InputStyled
									id="m-username"
									required
									value={form.username}
									data-testid="invite-username"
									onChange={(e) =>
										setForm((s) => ({
											...s,
											username: e.target.value,
										}))
									}
								/>
							</FieldStyled>
							<FieldStyled>
								<FieldLabelStyled htmlFor="m-email">
									Email
								</FieldLabelStyled>
								<InputStyled
									id="m-email"
									type="email"
									required
									value={form.email}
									data-testid="invite-email"
									onChange={(e) =>
										setForm((s) => ({
											...s,
											email: e.target.value,
										}))
									}
								/>
							</FieldStyled>
							<FieldStyled>
								<FieldLabelStyled htmlFor="m-phone">
									Phone (optional)
								</FieldLabelStyled>
								<InputStyled
									id="m-phone"
									value={form.phone}
									data-testid="invite-phone"
									onChange={(e) =>
										setForm((s) => ({
											...s,
											phone: e.target.value,
										}))
									}
								/>
							</FieldStyled>
							{error && <ErrorBoxStyled>{error}</ErrorBoxStyled>}
						</ModalBodyStyled>
						<ModalFooterStyled>
							<DirtyStatusStyled>
								The manager will be sent an invite link and
								stays pending until they accept.
							</DirtyStatusStyled>
							<ModalFooterRightStyled>
								<Button
									type="button"
									variant="ghost"
									size="md"
									onClick={onClose}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									variant="primary"
									size="md"
									disabled={submitting}
									data-testid="invite-submit"
								>
									{submitting ? "Sending…" : "Send invite"}
								</Button>
							</ModalFooterRightStyled>
						</ModalFooterStyled>
					</form>
				)}

				{issued && (
					<div data-testid="invite-issued">
						<ModalHeadStyled>
							<div>
								<Eyebrow $gold className="modal-eyebrow">
									Invite sent
								</Eyebrow>
								<ModalTitleStyled id="invite-modal-title">
									Share this one-time link
								</ModalTitleStyled>
							</div>
							<CloseButtonStyled
								type="button"
								onClick={() => {
									const id = issued.manager.id;
									setIssued(null);
									setForm(EMPTY_INVITE);
									onCreated(id);
								}}
								aria-label="Close"
							>
								<Icon name="x" size={16} />
							</CloseButtonStyled>
						</ModalHeadStyled>
						<ModalBodyStyled>
							<DirtyStatusStyled className="spaced-below">
								We notified{" "}
								<strong>{issued.manager.email}</strong>. If they
								don't get the email, share this link — it works
								once.
							</DirtyStatusStyled>
							<FullWidthInputStyled
								readOnly
								onFocus={(e) => e.currentTarget.select()}
								value={
									typeof window === "undefined"
										? issued.invite.path
										: new URL(
												issued.invite.path,
												window.location.origin,
											).toString()
								}
								data-testid="invite-issued-url"
							/>
							<DirtyStatusStyled className="spaced-above-sm">
								Expires{" "}
								<strong>
									{new Date(
										issued.invite.expiresAt,
									).toLocaleString()}
								</strong>
								. The manager has zero permissions until they
								accept.
							</DirtyStatusStyled>
						</ModalBodyStyled>
						<ModalFooterStyled>
							<DirtyStatusStyled>
								{copied
									? "Copied!"
									: "Copy and send to the manager."}
							</DirtyStatusStyled>
							<ModalFooterRightStyled>
								<Button
									type="button"
									variant="secondary"
									size="md"
									icon="paperclip"
									onClick={copyLink}
									data-testid="invite-copy"
								>
									{copied ? "Copied" : "Copy link"}
								</Button>
								<Button
									type="button"
									variant="primary"
									size="md"
									onClick={() => {
										const id = issued.manager.id;
										setIssued(null);
										setForm(EMPTY_INVITE);
										onCreated(id);
									}}
									data-testid="invite-done"
								>
									Done
								</Button>
							</ModalFooterRightStyled>
						</ModalFooterStyled>
					</div>
				)}
			</ModalShellStyled>
		</BackdropStyled>
	);
}

// ─── Detail modal ────────────────────────────────────────────────────────────

function DetailModal({
	manager,
	onClose,
	onChanged,
}: {
	manager: IManager;
	onClose: () => void;
	onChanged: () => void;
}) {
	const [draft, setDraft] = useState<string[]>(manager.permissions);
	const [savingPerms, setSavingPerms] = useState(false);
	const [statusBusy, setStatusBusy] = useState(false);
	const [resending, setResending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	// Surfaced when the admin resends an invite — we show the new URL once,
	// the same way the create-flow does.
	const [reissued, setReissued] = useState<IIssuedInvite | null>(null);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		setDraft(manager.permissions);
	}, [manager.permissions]);

	useEscapeKey(onClose);

	const dirty = useMemo(() => {
		const a = new Set(manager.permissions);
		const b = new Set(draft);
		if (a.size !== b.size) return true;
		for (const v of a) if (!b.has(v)) return true;
		return false;
	}, [manager.permissions, draft]);

	const isPending = manager.status === "pending";
	const isRejected = manager.status === "rejected";
	const permissionsLocked = isPending || isRejected;
	const canResend = isPending || isRejected;

	function toggle(key: string, on: boolean) {
		if (permissionsLocked) return;
		setDraft((current) => {
			const next = new Set(current);
			if (on) next.add(key);
			else next.delete(key);
			return Array.from(next);
		});
	}

	async function save() {
		if (permissionsLocked) return;
		setSavingPerms(true);
		setError(null);
		try {
			await api().patch(`/api/admin/managers/${manager.id}`, {
				permissions: draft,
			});
			onChanged();
		} catch (err) {
			setError(getErrorMessage(err, "Could not save permissions"));
		} finally {
			setSavingPerms(false);
		}
	}

	async function toggleStatus() {
		setStatusBusy(true);
		setError(null);
		try {
			const action =
				manager.status === "suspended" ? "reactivate" : "suspend";
			await api().patch(`/api/admin/managers/${manager.id}`, { action });
			onChanged();
		} catch (err) {
			setError(getErrorMessage(err, "Could not update status"));
		} finally {
			setStatusBusy(false);
		}
	}

	async function resendInvite() {
		setResending(true);
		setError(null);
		try {
			const res = await api().post(
				`/api/admin/managers/${manager.id}/resend-invite`,
			);
			const invite: IIssuedInvite | undefined = res.data?.data?.invite;
			if (invite) setReissued(invite);
			onChanged();
		} catch (err) {
			setError(getErrorMessage(err, "Could not resend invite"));
		} finally {
			setResending(false);
		}
	}

	async function copyLink() {
		if (!reissued) return;
		const fullUrl = new URL(
			reissued.path,
			window.location.origin,
		).toString();
		try {
			await navigator.clipboard.writeText(fullUrl);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			// ignore — input remains selectable for manual copy
		}
	}

	return (
		<BackdropStyled
			role="dialog"
			aria-modal="true"
			aria-labelledby="detail-modal-title"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
			data-testid="manager-detail"
		>
			<ModalShellStyled $wide>
				<ModalHeadStyled>
					<div className="head-id">
						<Avatar name={manager.fullName} size={48} />
						<div>
							<Eyebrow $gold className="modal-eyebrow">
								Permissions
							</Eyebrow>
							<ModalTitleStyled id="detail-modal-title">
								{manager.fullName}
							</ModalTitleStyled>
							<div className="head-email">{manager.email}</div>
						</div>
					</div>
					<div className="head-status">
						<Pill tone={statusTone(manager.status)}>
							{manager.status}
						</Pill>
						<CloseButtonStyled
							type="button"
							onClick={onClose}
							aria-label="Close"
						>
							<Icon name="x" size={16} />
						</CloseButtonStyled>
					</div>
				</ModalHeadStyled>

				<ModalBodyStyled data-testid="permission-toggles">
					{permissionsLocked && (
						<div
							data-testid="manager-pending-banner"
							className="pending-banner"
						>
							<strong>
								{isPending
									? "Invite pending."
									: "Invite declined."}
							</strong>{" "}
							{isPending
								? "Permissions are locked until the manager accepts the invite — that's intentional, so a manager can't be granted access before they confirm the account."
								: "This manager declined the invite. Resend a fresh one to reopen access."}
						</div>
					)}
					{reissued && (
						<div
							data-testid="manager-reissued"
							className="reissued-box"
						>
							<DirtyStatusStyled className="spaced-below-sm">
								New invite link (expires{" "}
								{new Date(reissued.expiresAt).toLocaleString()}
								):
							</DirtyStatusStyled>
							<FullWidthInputStyled
								readOnly
								onFocus={(e) => e.currentTarget.select()}
								value={
									typeof window === "undefined"
										? reissued.path
										: new URL(
												reissued.path,
												window.location.origin,
											).toString()
								}
								data-testid="manager-reissued-url"
							/>
							<div className="reissued-copy">
								<Button
									type="button"
									variant="secondary"
									size="sm"
									icon="paperclip"
									onClick={copyLink}
									data-testid="manager-reissued-copy"
								>
									{copied ? "Copied" : "Copy link"}
								</Button>
							</div>
						</div>
					)}
					{PERMISSION_GROUPS.map((g) => (
						<PermGroupStyled key={g.label}>
							<PermGroupHeadStyled>
								<PermGroupTitleStyled>
									{g.label}
								</PermGroupTitleStyled>
								<PermGroupHintStyled>
									{g.hint}
								</PermGroupHintStyled>
							</PermGroupHeadStyled>
							{g.items.map((p) => {
								const on = draft.includes(p.key);
								return (
									<PermissionRowStyled
										key={p.key}
										data-testid={`perm-${p.key}`}
										className={
											permissionsLocked
												? "locked"
												: undefined
										}
									>
										<span>{p.label}</span>
										<ToggleStyled
											checked={on}
											disabled={permissionsLocked}
											data-testid={`perm-toggle-${p.key}`}
											onChange={(e) =>
												toggle(p.key, e.target.checked)
											}
										/>
									</PermissionRowStyled>
								);
							})}
						</PermGroupStyled>
					))}
					{error && <ErrorBoxStyled>{error}</ErrorBoxStyled>}
				</ModalBodyStyled>

				<ModalFooterStyled>
					<DirtyStatusStyled>
						{permissionsLocked
							? "Permission grants are locked until the manager accepts."
							: dirty
								? "Unsaved changes — click Save to apply."
								: "Up to date."}
					</DirtyStatusStyled>
					<ModalFooterRightStyled>
						{canResend && (
							<Button
								type="button"
								variant="secondary"
								size="md"
								icon="send"
								disabled={resending}
								onClick={resendInvite}
								data-testid="resend-invite"
							>
								{resending ? "Resending…" : "Resend invite"}
							</Button>
						)}
						{!canResend && (
							<Button
								type="button"
								variant="secondary"
								size="md"
								disabled={statusBusy}
								onClick={toggleStatus}
								data-testid="toggle-status"
							>
								{manager.status === "suspended"
									? "Reactivate"
									: "Suspend"}
							</Button>
						)}
						{dirty && !permissionsLocked && (
							<Button
								type="button"
								variant="ghost"
								size="md"
								onClick={() => setDraft(manager.permissions)}
							>
								Discard
							</Button>
						)}
						<Button
							type="button"
							variant="primary"
							size="md"
							disabled={
								permissionsLocked || !dirty || savingPerms
							}
							onClick={save}
							data-testid="save-permissions"
						>
							{savingPerms ? "Saving…" : "Save permissions"}
						</Button>
					</ModalFooterRightStyled>
				</ModalFooterStyled>
			</ModalShellStyled>
		</BackdropStyled>
	);
}

// ─── Misc helpers ────────────────────────────────────────────────────────────

function useEscapeKey(handler: () => void) {
	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") handler();
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [handler]);
}
