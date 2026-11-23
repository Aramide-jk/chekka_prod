"use client";

import Link from "next/link";
import useSWR from "swr";
import { Button, Icon, type IconName, Pill } from "@/components";
import { fetcher } from "@/constants";
import { PageShell } from "@/layouts";
import type { IResponseEnvelope } from "@/types";
import {
	EmptyTileStyled,
	GridStyled,
	SectionDividerStyled,
	StatLabelStyled,
	StatStyled,
	StatsRowStyled,
	StatValueStyled,
	TileHeadStyled,
	TileStyled,
	TileTitleStyled,
} from "./styled";

interface IAdminCounts {
	inspectionsManage: number;
	inspectorsActive: number;
	inspectorsPending: number;
	specialRequests: number;
	liveInspections: number;
	disputesOpen: number;
	brokerRequestsPending: number;
	overdueReports: number;
	inspectionsThisWeek: number;
	disputesResolvedPercent: number;
	revenueMtdNaira: number;
	platformCommissionPercent: number;
	totalPaymentsMtdNaira: number;
	inspectorPayableMtdNaira: number;
	paidOutMtdNaira: number;
	pendingPayoutMtdNaira: number;
	failedPayoutsMtd: number;
}

type CountKey = keyof IAdminCounts;

// Required-permission metadata travels alongside the tile spec so we can
// render the right subset for managers without hard-coding the filter in two
// places. Tiles without `requiredPermission` are admin-only. `countKey` maps
// the tile to a field on the /api/admin/counts payload; tiles without one
// render a static label (e.g. "live", "delegation").
interface TileSpec {
	title: string;
	label: string;
	icon: IconName;
	href: string;
	tone: "gold" | "caution" | "danger" | "info";
	requiredPermission?: string;
	countKey?: CountKey;
}

const QUEUE_TILES: TileSpec[] = [
	{
		// Admin-only — this is the management surface (reassign / cancel are
		// admin-gated endpoints). Managers get the read-only "Live monitoring"
		// tile instead. No requiredPermission ⇒ managers never see this.
		title: "Inspections",
		label: "active",
		icon: "car",
		href: "/admin/inspections",
		tone: "gold",
		countKey: "inspectionsManage",
	},
	{
		title: "Inspectors",
		label: "pending",
		icon: "users",
		href: "/admin/inspectors",
		tone: "gold",
		requiredPermission: "inspectors.view",
		countKey: "inspectorsPending",
	},
	{
		title: "Special requests",
		label: "open",
		icon: "sparkles",
		href: "/admin/special-requests",
		tone: "info",
		requiredPermission: "special_requests.view",
		countKey: "specialRequests",
	},
	{
		title: "Live inspections",
		label: "in flight",
		icon: "camera",
		href: "/admin/inspections/live",
		tone: "gold",
		requiredPermission: "live.view",
		countKey: "liveInspections",
	},
	{
		title: "Disputes",
		label: "open",
		icon: "warning",
		href: "/admin/disputes",
		tone: "danger",
		requiredPermission: "disputes.view",
		countKey: "disputesOpen",
	},
	{
		title: "Broker requests",
		label: "open",
		icon: "briefcase",
		href: "/admin/broker-requests",
		tone: "info",
		requiredPermission: "broker_requests.view",
		countKey: "brokerRequestsPending",
	},
	{
		title: "Overdue reports",
		label: "open",
		icon: "clock",
		href: "/admin/overdue",
		tone: "caution",
		requiredPermission: "overdue.view",
		countKey: "overdueReports",
	},
];

const CONFIG_TILES: TileSpec[] = [
	{
		title: "Site settings",
		label: "sections",
		icon: "settings",
		href: "/admin/settings",
		tone: "gold",
		requiredPermission: "site_config.view",
	},
	{
		title: "Audit log",
		label: "live",
		icon: "shield-check",
		href: "/admin/audit-logs",
		tone: "info",
		requiredPermission: "audit.view",
	},
	// Admin-only — no requiredPermission means managers never see this.
	{
		title: "Managers",
		label: "delegation",
		icon: "users",
		href: "/admin/managers",
		tone: "gold",
	},
];

interface ISessionUser {
	id: string;
	role: "buyer" | "inspector" | "consultant" | "manager" | "admin";
	permissions?: string[];
}

function pickTiles(tiles: TileSpec[], user: ISessionUser | null): TileSpec[] {
	if (!user) return [];
	if (user.role === "admin") return tiles;
	if (user.role !== "manager") return [];
	const perms = new Set(user.permissions ?? []);
	return tiles.filter((t) => {
		// Admin-only tiles (no requiredPermission) are excluded for managers.
		if (!t.requiredPermission) return false;
		return perms.has(t.requiredPermission);
	});
}

function formatRevenue(n: number): string {
	if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
	if (n >= 1_000) return `₦${(n / 1_000).toFixed(1)}K`;
	return `₦${n.toLocaleString()}`;
}

export default function AdminDashboardWrapper() {
	const { data } = useSWR<IResponseEnvelope<{ user: ISessionUser }>>(
		"/api/auth/session",
		fetcher,
		{ revalidateOnMount: true },
	);
	const user = data?.data?.user ?? null;
	const queueTiles = pickTiles(QUEUE_TILES, user);
	const configTiles = pickTiles(CONFIG_TILES, user);

	// Counts only load once the user is known to be admin/manager — saves a
	// 403 round trip for anonymous renders and ensures the SWR key only fires
	// for users who can actually see this page.
	const canSeeCounts = user?.role === "admin" || user?.role === "manager";
	const { data: countsData } = useSWR<
		IResponseEnvelope<{ counts: IAdminCounts }>
	>(canSeeCounts ? "/api/admin/counts" : null, fetcher, {
		revalidateOnMount: true,
		refreshInterval: 60_000,
	});
	const counts = countsData?.data?.counts;

	const isManagerWithoutAccess =
		user?.role === "manager" &&
		queueTiles.length === 0 &&
		configTiles.length === 0;

	return (
		<PageShell
			eyebrow={user?.role === "manager" ? "Manager" : "Admin"}
			title={user?.role === "manager" ? "Delegated" : "Mission"}
			titleEm="control"
			navTitle={user?.role === "manager" ? "Manager" : "Admin"}
			subtitle={
				user?.role === "manager"
					? "Only the slices you've been granted appear below. Ask an admin if you need more."
					: "Every queue, every dispute, every overdue report — in one place."
			}
		>
			{/* Stats are admin-only — they aggregate platform-wide counts the
			    delegated managers don't necessarily get to see. */}
			{user?.role === "admin" && (
				<StatsRowStyled>
					<StatStyled>
						<StatLabelStyled>Buyer payments (MTD)</StatLabelStyled>
						<StatValueStyled>
							{counts ? formatRevenue(counts.totalPaymentsMtdNaira) : "—"}
						</StatValueStyled>
					</StatStyled>
					<StatStyled>
						<StatLabelStyled>Commission earned</StatLabelStyled>
						<StatValueStyled>
							{counts ? `${formatRevenue(counts.revenueMtdNaira)} · ${counts.platformCommissionPercent}%` : "—"}
						</StatValueStyled>
					</StatStyled>
					<StatStyled>
						<StatLabelStyled>Inspector paid</StatLabelStyled>
						<StatValueStyled>
							{counts
								? formatRevenue(counts.paidOutMtdNaira)
								: "—"}
						</StatValueStyled>
					</StatStyled>
					<StatStyled>
						<StatLabelStyled>Payout held / pending</StatLabelStyled>
						<StatValueStyled>
							{counts
								? formatRevenue(counts.pendingPayoutMtdNaira)
								: "—"}
						</StatValueStyled>
					</StatStyled>
				</StatsRowStyled>
			)}

			{isManagerWithoutAccess && (
				<EmptyTileStyled data-testid="manager-zero-access">
					You haven't been granted any permissions yet. Ask an admin
					to grant you access.
				</EmptyTileStyled>
			)}

			{queueTiles.length > 0 && (
				<GridStyled data-testid="admin-queue-tiles">
					{queueTiles.map((t) => {
						const value = t.countKey
							? (counts?.[t.countKey] ?? null)
							: null;
						return (
							<TileStyled key={t.title} data-testid={`tile-${t.href}`}>
								<TileHeadStyled>
									<Icon name={t.icon} size={22} />
									<Pill tone={t.tone}>
										{value === null ? "—" : value} {t.label}
									</Pill>
								</TileHeadStyled>
								<TileTitleStyled>{t.title}</TileTitleStyled>
								<Link href={t.href}>
									<Button
										variant="secondary"
										size="sm"
										iconRight="chevron-right"
									>
										Open queue
									</Button>
								</Link>
							</TileStyled>
						);
					})}
				</GridStyled>
			)}

			{configTiles.length > 0 && (
				<>
					<SectionDividerStyled>Configuration</SectionDividerStyled>
					<GridStyled data-testid="admin-config-tiles">
						{configTiles.map((t) => (
							<TileStyled key={t.title} data-testid={`tile-${t.href}`}>
								<TileHeadStyled>
									<Icon name={t.icon} size={22} />
									<Pill tone={t.tone}>{t.label}</Pill>
								</TileHeadStyled>
								<TileTitleStyled>{t.title}</TileTitleStyled>
								<Link href={t.href}>
									<Button
										variant="secondary"
										size="sm"
										iconRight="chevron-right"
									>
										Open
									</Button>
								</Link>
							</TileStyled>
						))}
					</GridStyled>
				</>
			)}
		</PageShell>
	);
}
