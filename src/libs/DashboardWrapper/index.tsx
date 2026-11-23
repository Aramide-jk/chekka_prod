"use client";

import Link from "next/link";
import useSWR from "swr";
import { Button, Icon, Pill } from "@/components";
import { fetcher } from "@/constants";
import { PageShell } from "@/layouts";
import type { IResponseEnvelope } from "@/types";
import {
	ActionStackStyled,
	BrokerCopyStyled,
	ColumnStyled,
	EmptyStyled,
	GridStyled,
	RowMainStyled,
	RowMetaStyled,
	RowSideStyled,
	RowStyled,
	RowTextStyled,
	RowTitleStyled,
	SectionHeadStyled,
	SectionStyled,
	SectionTitleStyled,
	SideStyled,
	StatLabelStyled,
	StatStyled,
	StatsRowStyled,
	StatValueStyled,
	ThumbStyled,
} from "./styled";

interface IInspection {
	_id: string;
	status: string;
	car: { make: string; model: string; year: number };
	photoCount?: number;
	scheduledFor?: string;
	slot?: string;
	report?: { verdict?: "good" | "caution" | "danger" };
	createdAt?: string;
	inspector?: { id: string; fullName: string } | null;
}

interface IBuyerDashboard {
	stats: {
		active: number;
		completed: number;
		worthBuying: number;
		avoided: number;
	};
	active: IInspection[];
	recent: IInspection[];
}

const STATUS_LABEL: Record<
	string,
	{ label: string; tone: "gold" | "info" | "ghost" }
> = {
	submitted: { label: "Awaiting assignment", tone: "ghost" },
	assigned: { label: "Inspector assigned", tone: "info" },
	scheduled: { label: "Scheduled", tone: "info" },
	in_progress: { label: "Live now", tone: "gold" },
	report_processing: { label: "Report processing", tone: "ghost" },
	declined: { label: "Declined", tone: "ghost" },
	completed: { label: "Completed", tone: "info" },
};

const VERDICT_LABEL: Record<
	string,
	{ label: string; tone: "good" | "caution" | "danger" }
> = {
	good: { label: "Worth Buying", tone: "good" },
	caution: { label: "Buy With Caution", tone: "caution" },
	danger: { label: "Not Recommended", tone: "danger" },
};

function carLabel(c: IInspection["car"]) {
	return `${c.make} ${c.model} ${c.year}`;
}

function formatWhen(s?: string) {
	if (!s) return "";
	const d = new Date(s);
	const diff = Date.now() - d.getTime();
	const days = Math.floor(diff / (24 * 60 * 60 * 1000));
	if (days < 1) return "Today";
	if (days < 2) return "Yesterday";
	if (days < 7) return `${days} days ago`;
	return d.toLocaleDateString();
}

export default function DashboardWrapper() {
	const { data, error, isLoading } = useSWR<
		IResponseEnvelope<IBuyerDashboard>
	>("/api/dashboard/buyer", fetcher, { revalidateOnMount: true });

	const stats = data?.data?.stats ?? {
		active: 0,
		completed: 0,
		worthBuying: 0,
		avoided: 0,
	};
	const active = data?.data?.active ?? [];
	const recent = data?.data?.recent ?? [];
	const unauthenticated =
		!!error &&
		(error as { response?: { status?: number } }).response?.status === 401;

	return (
		<PageShell
			eyebrow="Your dashboard"
			title="Welcome back,"
			titleEm="Buyer"
			navTitle="Dashboard"
			subtitle="Track every inspection in flight, read your reports, and pick up where you left off."
			right={
				<Link href="/book">
					<Button variant="primary" size="md" icon="plus">
						Book inspection
					</Button>
				</Link>
			}
		>
			<StatsRowStyled data-testid="dashboard-stats">
				<StatStyled>
					<StatLabelStyled>Active</StatLabelStyled>
					<StatValueStyled>{stats.active}</StatValueStyled>
				</StatStyled>
				<StatStyled>
					<StatLabelStyled>Completed</StatLabelStyled>
					<StatValueStyled>{stats.completed}</StatValueStyled>
				</StatStyled>
				<StatStyled>
					<StatLabelStyled>Worth buying</StatLabelStyled>
					<StatValueStyled>{stats.worthBuying}</StatValueStyled>
				</StatStyled>
				<StatStyled>
					<StatLabelStyled>Avoided</StatLabelStyled>
					<StatValueStyled>{stats.avoided}</StatValueStyled>
				</StatStyled>
			</StatsRowStyled>

			<GridStyled>
				<ColumnStyled>
					<SectionStyled>
						<SectionHeadStyled>
							<SectionTitleStyled>
								Active inspections
							</SectionTitleStyled>
							{active.length > 0 && (
								<Pill tone="gold" dot>
									Live
								</Pill>
							)}
						</SectionHeadStyled>
						{isLoading && active.length === 0 && (
							<EmptyStyled>Loading…</EmptyStyled>
						)}
						{!isLoading && active.length === 0 && (
							<EmptyStyled>
								{unauthenticated
									? "Sign in to see your inspections."
									: "No active inspections — book one to get started."}
							</EmptyStyled>
						)}
						{active.map((a) => {
							const meta = STATUS_LABEL[a.status] ?? {
								label: a.status,
								tone: "ghost",
							};
							const who = a.inspector?.fullName;
							const base =
								a.status === "in_progress"
									? `Inspector working · ${a.photoCount ?? 0} photos`
									: a.status === "scheduled" && a.scheduledFor
										? `Scheduled ${new Date(a.scheduledFor).toLocaleDateString()} · ${a.slot ?? ""}`
										: `Created ${formatWhen(a.createdAt)}`;
							const subtitle = who ? `${who} · ${base}` : base;
							return (
								<RowStyled key={a._id}>
									<RowMainStyled>
										<ThumbStyled>
											<Icon name="car" size={20} />
										</ThumbStyled>
										<RowTextStyled>
											<RowTitleStyled>
												{carLabel(a.car)}
											</RowTitleStyled>
											<RowMetaStyled>
												{subtitle}
											</RowMetaStyled>
										</RowTextStyled>
									</RowMainStyled>
									<RowSideStyled>
										<Pill
											tone={meta.tone}
											dot={meta.tone === "gold"}
										>
											{meta.label}
										</Pill>
										<Link href={`/inspections/${a._id}`}>
											<Button variant="ghost" size="sm">
												View
											</Button>
										</Link>
									</RowSideStyled>
								</RowStyled>
							);
						})}
					</SectionStyled>

					<SectionStyled>
						<SectionHeadStyled>
							<SectionTitleStyled>
								Recent reports
							</SectionTitleStyled>
							<div className="actions">
								<a
									href="/api/inspections/reports-pdf"
									target="_blank"
									rel="noopener noreferrer"
								>
									<Button
										variant="secondary"
										size="sm"
										icon="download"
										disabled={recent.length === 0}
									>
										Print All Reports
									</Button>
								</a>
							</div>
						</SectionHeadStyled>
						{!isLoading && recent.length === 0 && (
							<EmptyStyled>No completed reports yet.</EmptyStyled>
						)}
						{recent.map((r) => {
							const v = r.report?.verdict
								? VERDICT_LABEL[r.report.verdict]
								: null;
							return (
								<RowStyled key={r._id}>
									<RowMainStyled>
										<ThumbStyled>
											<Icon
												name="shield-check"
												size={20}
											/>
										</ThumbStyled>
										<RowTextStyled>
											<RowTitleStyled>
												{carLabel(r.car)}
											</RowTitleStyled>
											<RowMetaStyled>
												{formatWhen(r.createdAt)}
											</RowMetaStyled>
										</RowTextStyled>
									</RowMainStyled>
									<RowSideStyled>
										{v && (
											<Pill tone={v.tone}>{v.label}</Pill>
										)}
										<Link href={`/inspections/${r._id}`}>
											<Button variant="ghost" size="sm">
												Read
											</Button>
										</Link>
									</RowSideStyled>
								</RowStyled>
							);
						})}
					</SectionStyled>
				</ColumnStyled>

				<SideStyled>
					<SectionStyled>
						<SectionTitleStyled className="spaced">
							Quick actions
						</SectionTitleStyled>
						<ActionStackStyled>
							<Link href="/book">
								<Button
									variant="secondary"
									size="md"
									fullWidth
									icon="plus"
								>
									Book inspection
								</Button>
							</Link>
							<Link href="/inspectors">
								<Button
									variant="secondary"
									size="md"
									fullWidth
									icon="user"
								>
									Browse inspectors
								</Button>
							</Link>
							<Link href="/book/1?urgent=1">
								<Button
									variant="ghost"
									size="md"
									fullWidth
									icon="clock"
								>
									Urgent inspection
								</Button>
							</Link>
							<Link href="/chat">
								<Button
									variant="secondary"
									size="md"
									fullWidth
									icon="chat"
								>
									Chat with consultant
								</Button>
							</Link>
							<Link href="/sample-report">
								<Button
									variant="ghost"
									size="md"
									fullWidth
									icon="eye"
								>
									See a sample report
								</Button>
							</Link>
						</ActionStackStyled>
					</SectionStyled>

					<SectionStyled>
						<SectionTitleStyled className="spaced">
							Need a broker?
						</SectionTitleStyled>
						<BrokerCopyStyled>
							A Chekka broker negotiates with the seller, handles
							payment securely, and arranges delivery — so you
							don't have to.
						</BrokerCopyStyled>
						<Link href="/chat?context=broker">
							<Button variant="primary" size="md" fullWidth>
								Talk to a broker
							</Button>
						</Link>
					</SectionStyled>
				</SideStyled>
			</GridStyled>
		</PageShell>
	);
}
