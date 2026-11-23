"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import {
	Avatar,
	Button,
	Eyebrow,
	Icon,
	Pill,
	type PillTone,
} from "@/components";
import { api, fetcher, getErrorMessage } from "@/constants";
import { PageShell } from "@/layouts";
import type { IResponseEnvelope } from "@/types";
import {
	BioStyled,
	DetailGridStyled,
	DetailRowStyled,
	DocChipStyled,
	DocListStyled,
	EmptyStyled,
	FilterChipStyled,
	FiltersRowStyled,
	ModalActionsStyled,
	ModalCardStyled,
	ModalHeadStyled,
	ModalStyled,
	ModalSubtitleStyled,
	ModalTitleStyled,
	RowChevronStyled,
	RowMetaStyled,
	RowNameStyled,
	RowStyled,
	SectionLabelStyled,
	SectionStyled,
	TagsStyled,
} from "./styled";

type StatusFilter = "pending" | "approved" | "suspended" | "rejected" | "all";

type InspectorStatus =
	| "pending"
	| "approved"
	| "rejected"
	| "suspended"
	| "active";

interface IRawInspector {
	_id: string;
	userId: string;
	yearsExperience: number;
	rating: number;
	totalCompleted: number;
	specialisations?: string[];
	bio?: string;
	documents?: {
		idDocument?: string;
		certificate?: string;
		extra?: string;
	};
	certificateApprovedAt?: string | null;
	availability?: { toggleOn?: boolean };
	createdAt: string;
	updatedAt?: string;
	user: {
		_id: string;
		fullName: string;
		email: string;
		phone?: string;
		city?: string;
		status: InspectorStatus;
	};
}

interface IPendingApplication {
	_id: string;
	userId: string;
	yearsExperience?: number;
	specialisations?: string[];
	bio?: string;
	documents?: {
		idDocument?: string;
		certificate?: string;
		extra?: string;
	};
	certificateApprovedAt?: string | null;
	availability?: { toggleOn?: boolean };
	createdAt?: string;
	updatedAt?: string;
	user?: {
		_id?: string;
		fullName?: string;
		email?: string;
		phone?: string;
		city?: string;
	};
}

type AdminInspectorAction = "approve" | "reject" | "suspend" | "reactivate";

const FILTERS: Array<{
	value: StatusFilter;
	label: string;
}> = [
	{ value: "pending", label: "Pending" },
	{ value: "approved", label: "Approved" },
	{ value: "suspended", label: "Suspended" },
	{ value: "rejected", label: "Rejected" },
	{ value: "all", label: "All" },
];

const STATUS_TONE: Record<InspectorStatus, PillTone> = {
	pending: "info",
	approved: "good",
	rejected: "danger",
	suspended: "caution",
	active: "good",
};

function initials(name?: string): string {
	if (!name) return "?";
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function relTime(d?: string) {
	if (!d) return "—";
	const diff = Date.now() - new Date(d).getTime();
	if (diff < 60_000) return "just now";
	if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
	if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} h ago`;
	return `${Math.floor(diff / 86_400_000)} d ago`;
}

function formatDate(d?: string): string {
	if (!d) return "—";
	const date = new Date(d);
	if (Number.isNaN(date.getTime())) return "—";
	return date.toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function pendingToInspector(p: IPendingApplication): IRawInspector {
	return {
		_id: p._id,
		userId: p.userId,
		yearsExperience: p.yearsExperience ?? 0,
		rating: 0,
		totalCompleted: 0,
		specialisations: p.specialisations,
		bio: p.bio,
		documents: p.documents,
		certificateApprovedAt: p.certificateApprovedAt,
		availability: p.availability,
		createdAt: p.createdAt ?? "",
		updatedAt: p.updatedAt,
		user: {
			_id: p.user?._id ?? p.userId,
			fullName: p.user?.fullName ?? "Unknown",
			email: p.user?.email ?? "",
			phone: p.user?.phone,
			city: p.user?.city,
			status: "pending",
		},
	};
}

export default function InspectorsWrapper() {
	const [filter, setFilter] = useState<StatusFilter>("pending");
	const [selectedId, setSelectedId] = useState<string | null>(null);

	// Pending applications use the legacy no-param endpoint (cached). Every
	// other filter goes through the new `status=` path that returns the full
	// roster.
	const swrKey =
		filter === "pending"
			? "/api/admin/inspectors"
			: `/api/admin/inspectors?status=${filter}`;

	const { data, isLoading } = useSWR<
		IResponseEnvelope<{
			applications?: IPendingApplication[];
			inspectors?: IRawInspector[];
		}>
	>(swrKey, fetcher, { revalidateOnMount: true });

	const rows = useMemo<IRawInspector[]>(() => {
		if (filter === "pending") {
			return (data?.data?.applications ?? []).map(pendingToInspector);
		}
		return data?.data?.inspectors ?? [];
	}, [filter, data]);

	const selected = useMemo(
		() => rows.find((r) => (r.user._id || r.userId) === selectedId) ?? null,
		[rows, selectedId],
	);

	return (
		<PageShell
			eyebrow="Inspectors"
			title="Manage"
			titleEm="inspectors"
			navTitle="Admin · Inspectors"
			subtitle="Approve applications, suspend bad actors, reactivate when appropriate."
		>
			<SectionStyled data-testid="admin-inspectors">
				<FiltersRowStyled>
					{FILTERS.map((f) => (
						<FilterChipStyled
							key={f.value}
							$active={filter === f.value}
							onClick={() => setFilter(f.value)}
						>
							{f.label}
						</FilterChipStyled>
					))}
				</FiltersRowStyled>

				<Eyebrow $gold className="results-eyebrow">
					{isLoading ? "Loading…" : `Results (${rows.length})`}
				</Eyebrow>

				{!isLoading && rows.length === 0 && (
					<EmptyStyled>No inspectors match this filter.</EmptyStyled>
				)}

				{rows.map((insp) => {
					const userId = insp.user._id || insp.userId;
					const status = insp.user.status;
					return (
						<RowStyled
							key={insp._id || userId}
							type="button"
							onClick={() => setSelectedId(userId)}
							aria-label={`Open details for ${insp.user.fullName}`}
						>
							<Avatar
								name={initials(insp.user.fullName)}
								size={36}
							/>
							<div>
								<RowNameStyled>
									{insp.user.fullName}
								</RowNameStyled>
								<RowMetaStyled>{insp.user.email}</RowMetaStyled>
							</div>
							<RowMetaStyled>
								{insp.user.city ?? "—"}
							</RowMetaStyled>
							<RowMetaStyled>
								{insp.yearsExperience} yrs · ★{" "}
								{Number(insp.rating || 0).toFixed(1)}
							</RowMetaStyled>
							<Pill tone={STATUS_TONE[status]}>
								{status === "active" ? "approved" : status}
							</Pill>
							<RowChevronStyled>
								<Icon name="chevron-right" size={16} />
							</RowChevronStyled>
						</RowStyled>
					);
				})}
			</SectionStyled>

			{selected && (
				<InspectorDetailModal
					inspector={selected}
					onClose={() => setSelectedId(null)}
					onMutated={() => globalMutate(swrKey)}
				/>
			)}
		</PageShell>
	);
}

function InspectorDetailModal({
	inspector,
	onClose,
	onMutated,
}: {
	inspector: IRawInspector;
	onClose: () => void;
	onMutated: () => Promise<unknown>;
}) {
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [onClose]);

	const userId = inspector.user._id || inspector.userId;
	const status = inspector.user.status;
	const hasCertificate = !!inspector.documents?.certificate;
	const isCertified = !!inspector.certificateApprovedAt;
	const docs = inspector.documents ?? {};
	const docEntries = (
		[
			["ID document", docs.idDocument],
			["Certificate", docs.certificate],
			["Extra document", docs.extra],
		] as const
	).filter(([, v]) => !!v) as Array<[string, string]>;

	async function act(action: AdminInspectorAction) {
		if (
			(action === "reject" || action === "suspend") &&
			typeof window !== "undefined" &&
			!window.confirm(
				`${action[0].toUpperCase()}${action.slice(1)} ${inspector.user.fullName}? They will be notified.`,
			)
		) {
			return;
		}
		setBusy(true);
		setError(null);
		try {
			await api().patch(`/api/admin/inspectors/${userId}`, { action });
			await onMutated();
			onClose();
		} catch (e) {
			setError(getErrorMessage(e, "Could not update inspector"));
			setBusy(false);
		}
	}

	async function setCertified(approved: boolean) {
		setBusy(true);
		setError(null);
		try {
			await api().patch(`/api/admin/inspectors/${userId}/certificate`, {
				approved,
			});
			await onMutated();
			onClose();
		} catch (e) {
			setError(getErrorMessage(e, "Could not update certification"));
			setBusy(false);
		}
	}

	return (
		<ModalStyled onClick={onClose}>
			<ModalCardStyled
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-label={`Inspector details for ${inspector.user.fullName}`}
			>
				<ModalHeadStyled>
					<Avatar
						name={initials(inspector.user.fullName)}
						size={56}
					/>
					<div className="head-id">
						<ModalTitleStyled>
							{inspector.user.fullName}
						</ModalTitleStyled>
						<ModalSubtitleStyled>
							{inspector.user.email}
						</ModalSubtitleStyled>
					</div>
					<Pill tone={STATUS_TONE[status]}>
						{status === "active" ? "approved" : status}
					</Pill>
				</ModalHeadStyled>

				<SectionLabelStyled>Contact</SectionLabelStyled>
				<DetailGridStyled>
					<DetailRowStyled>
						<span>Phone</span>
						<span>{inspector.user.phone || "—"}</span>
					</DetailRowStyled>
					<DetailRowStyled>
						<span>City</span>
						<span>{inspector.user.city || "—"}</span>
					</DetailRowStyled>
				</DetailGridStyled>

				<SectionLabelStyled>Performance</SectionLabelStyled>
				<DetailGridStyled>
					<DetailRowStyled>
						<span>Years experience</span>
						<span>{inspector.yearsExperience} yrs</span>
					</DetailRowStyled>
					<DetailRowStyled>
						<span>Rating</span>
						<span>
							★ {Number(inspector.rating || 0).toFixed(1)}
						</span>
					</DetailRowStyled>
					<DetailRowStyled>
						<span>Completed jobs</span>
						<span>{inspector.totalCompleted}</span>
					</DetailRowStyled>
					<DetailRowStyled>
						<span>Availability</span>
						<span>
							{inspector.availability?.toggleOn
								? "On"
								: status === "approved" || status === "active"
									? "Off"
									: "—"}
						</span>
					</DetailRowStyled>
					<DetailRowStyled>
						<span>Certification</span>
						<span>
							{isCertified ? (
								<Pill tone="good">Certified</Pill>
							) : hasCertificate ? (
								<Pill tone="info">Awaiting review</Pill>
							) : (
								"No certificate"
							)}
						</span>
					</DetailRowStyled>
					<DetailRowStyled>
						<span>Applied</span>
						<span>
							{formatDate(inspector.createdAt)} ·{" "}
							{relTime(inspector.createdAt)}
						</span>
					</DetailRowStyled>
					<DetailRowStyled>
						<span>Last updated</span>
						<span>
							{formatDate(
								inspector.updatedAt ?? inspector.createdAt,
							)}
						</span>
					</DetailRowStyled>
				</DetailGridStyled>

				{inspector.specialisations &&
					inspector.specialisations.length > 0 && (
						<>
							<SectionLabelStyled>
								Specialisations
							</SectionLabelStyled>
							<TagsStyled>
								{inspector.specialisations.map((s) => (
									<Pill key={s} tone="ghost">
										{s}
									</Pill>
								))}
							</TagsStyled>
						</>
					)}

				{inspector.bio && (
					<>
						<SectionLabelStyled>Bio</SectionLabelStyled>
						<BioStyled>{inspector.bio}</BioStyled>
					</>
				)}

				<SectionLabelStyled>Documents</SectionLabelStyled>
				{docEntries.length === 0 ? (
					<div className="no-docs">No documents on file.</div>
				) : (
					<DocListStyled>
						{docEntries.map(([label, url]) => (
							<DocChipStyled
								key={label}
								href={url}
								target="_blank"
								rel="noopener noreferrer"
							>
								<span>{label}</span>
								<span className="doc-open">
									View <Icon name="eye" size={13} />
								</span>
							</DocChipStyled>
						))}
					</DocListStyled>
				)}

				{error && (
					<div role="alert" className="error-line">
						{error}
					</div>
				)}

				<ModalActionsStyled>
					<Button variant="ghost" size="sm" onClick={onClose}>
						Close
					</Button>
					{hasCertificate &&
						(isCertified ? (
							<Button
								variant="ghost"
								size="sm"
								disabled={busy}
								onClick={() => setCertified(false)}
							>
								{busy ? "Working…" : "Revoke certification"}
							</Button>
						) : (
							<Button
								variant="secondary"
								size="sm"
								disabled={busy}
								onClick={() => setCertified(true)}
							>
								{busy ? "Working…" : "Approve certificate"}
							</Button>
						))}
					{status === "pending" && (
						<>
							<Button
								variant="ghost"
								size="sm"
								disabled={busy}
								onClick={() => act("reject")}
							>
								Reject
							</Button>
							<Button
								variant="primary"
								size="sm"
								disabled={busy}
								onClick={() => act("approve")}
							>
								{busy ? "Working…" : "Approve"}
							</Button>
						</>
					)}
					{(status === "approved" || status === "active") && (
						<Button
							variant="ghost"
							size="sm"
							disabled={busy}
							onClick={() => act("suspend")}
						>
							{busy ? "Working…" : "Suspend"}
						</Button>
					)}
					{status === "suspended" && (
						<Button
							variant="primary"
							size="sm"
							disabled={busy}
							onClick={() => act("reactivate")}
						>
							{busy ? "Working…" : "Reactivate"}
						</Button>
					)}
					{status === "rejected" && (
						<Button
							variant="ghost"
							size="sm"
							disabled={busy}
							onClick={() => act("approve")}
						>
							{busy ? "Working…" : "Re-approve"}
						</Button>
					)}
				</ModalActionsStyled>
			</ModalCardStyled>
		</ModalStyled>
	);
}
