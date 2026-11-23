"use client";

import { useMemo, useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import { Button, Eyebrow, Pill, type PillTone } from "@/components";
import { api, fetcher, getErrorMessage } from "@/constants";
import { PageShell } from "@/layouts";
import type { InspectionStatus, IResponseEnvelope } from "@/types";
import {
	EmptyStyled,
	FilterChipStyled,
	FiltersRowStyled,
	InspectorOptionStyled,
	ModalActionsStyled,
	ModalCardStyled,
	ModalStyled,
	RowActionsStyled,
	RowMetaStyled,
	RowNameStyled,
	RowStyled,
	SectionStyled,
} from "./styled";

type StatusFilter = InspectionStatus | "any";

interface IRawInspection {
	_id: string;
	status: InspectionStatus;
	inspectionType: string;
	car: {
		make: string;
		model: string;
		year: number;
		city: string;
		address?: string;
	};
	buyerId: string;
	assignedInspectorId?: string | null;
	inspectorId?: string | null;
	inspector?: { id: string; fullName: string } | null;
	price: number;
	scheduledFor?: string;
	createdAt: string;
}

interface IInspector {
	userId: string;
	user?: { fullName?: string; city?: string };
	rating?: number;
}

const FILTERS: Array<{ value: StatusFilter; label: string; tone: PillTone }> = [
	{ value: "any", label: "All", tone: "ghost" },
	{ value: "submitted", label: "Submitted", tone: "info" },
	{ value: "assigned", label: "Assigned", tone: "gold" },
	{ value: "declined", label: "Declined", tone: "danger" },
	{ value: "scheduled", label: "Scheduled", tone: "info" },
	{ value: "in_progress", label: "In progress", tone: "gold" },
	{ value: "report_processing", label: "Report processing", tone: "caution" },
	{ value: "completed", label: "Completed", tone: "good" },
];

const TONE_BY_STATUS: Record<InspectionStatus, PillTone> = {
	submitted: "info",
	assigned: "gold",
	declined: "danger",
	scheduled: "info",
	in_progress: "gold",
	report_processing: "caution",
	completed: "good",
};

function relTime(d?: string) {
	if (!d) return "—";
	const diff = Date.now() - new Date(d).getTime();
	if (diff < 60_000) return "just now";
	if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
	if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} h ago`;
	return `${Math.floor(diff / 86_400_000)} d ago`;
}

export default function InspectionsWrapper() {
	const [filter, setFilter] = useState<StatusFilter>("any");
	const swrKey = `/api/admin/inspections?status=${filter}&limit=100`;
	const { data, isLoading } = useSWR<
		IResponseEnvelope<{ inspections: IRawInspection[] }>
	>(swrKey, fetcher, { revalidateOnMount: true });
	const items = data?.data?.inspections ?? [];

	const [reassignTarget, setReassignTarget] = useState<IRawInspection | null>(
		null,
	);
	const [busyId, setBusyId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function cancel(insp: IRawInspection) {
		if (
			typeof window !== "undefined" &&
			!window.confirm(
				`Cancel inspection ${insp.car.make} ${insp.car.model}? Both parties will be notified.`,
			)
		) {
			return;
		}
		setBusyId(insp._id);
		setError(null);
		try {
			await api().post(`/api/admin/inspections/${insp._id}/cancel`, {});
			await globalMutate(swrKey);
		} catch (e) {
			setError(getErrorMessage(e, "Could not cancel inspection"));
		} finally {
			setBusyId(null);
		}
	}

	return (
		<PageShell
			eyebrow="Inspections"
			title="Manage"
			titleEm="inspections"
			navTitle="Admin · Inspections"
			subtitle="Every inspection across the platform. Reassign, cancel, or drill into a record."
		>
			<SectionStyled data-testid="admin-inspections">
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

				<Eyebrow $gold className="results-label">
					{isLoading ? "Loading…" : `Results (${items.length})`}
				</Eyebrow>

				{!isLoading && items.length === 0 && (
					<EmptyStyled>No inspections match this filter.</EmptyStyled>
				)}

				{items.map((i) => (
					<RowStyled key={i._id}>
						<RowNameStyled>
							{i.car.make} {i.car.model} {i.car.year}
						</RowNameStyled>
						<RowMetaStyled>{i.car.city}</RowMetaStyled>
						<RowMetaStyled>
							<div className="inspector-name">
								{i.inspector?.fullName ?? "Unassigned"}
							</div>
							<div className="row-time">
								{relTime(i.createdAt)}
							</div>
						</RowMetaStyled>
						<Pill tone={TONE_BY_STATUS[i.status]}>
							{i.status.replace(/_/g, " ")}
						</Pill>
						<RowActionsStyled>
							<Button
								variant="secondary"
								size="sm"
								onClick={() => setReassignTarget(i)}
								disabled={
									busyId === i._id || i.status === "completed"
								}
							>
								Reassign
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => cancel(i)}
								disabled={
									busyId === i._id || i.status === "completed"
								}
							>
								Cancel
							</Button>
						</RowActionsStyled>
					</RowStyled>
				))}

				{error && (
					<div role="alert" className="error-line">
						{error}
					</div>
				)}
			</SectionStyled>

			{reassignTarget && (
				<ReassignModal
					inspection={reassignTarget}
					onClose={() => setReassignTarget(null)}
					onDone={async () => {
						setReassignTarget(null);
						await globalMutate(swrKey);
					}}
				/>
			)}
		</PageShell>
	);
}

function ReassignModal({
	inspection,
	onClose,
	onDone,
}: {
	inspection: IRawInspection;
	onClose: () => void;
	onDone: () => Promise<void>;
}) {
	const { data, isLoading } = useSWR<
		IResponseEnvelope<{ inspectors: IInspector[] }>
	>(
		`/api/inspectors?limit=50${inspection.car.city ? `&city=${encodeURIComponent(inspection.car.city)}` : ""}`,
		fetcher,
		{ revalidateOnMount: true },
	);
	const inspectors = data?.data?.inspectors ?? [];
	const candidates = useMemo(
		() =>
			inspectors.filter(
				(p) =>
					p.userId &&
					p.userId !== (inspection.assignedInspectorId ?? ""),
			),
		[inspectors, inspection.assignedInspectorId],
	);
	const [pick, setPick] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function submit() {
		if (!pick) return;
		setBusy(true);
		setError(null);
		try {
			await api().post(
				`/api/admin/inspections/${inspection._id}/reassign`,
				{ inspectorId: pick },
			);
			await onDone();
		} catch (e) {
			setError(getErrorMessage(e, "Could not reassign"));
		} finally {
			setBusy(false);
		}
	}

	return (
		<ModalStyled onClick={onClose}>
			<ModalCardStyled onClick={(e) => e.stopPropagation()}>
				<Eyebrow $gold className="reassign-label">
					Reassign inspection
				</Eyebrow>
				<div className="reassign-sub">
					{inspection.car.make} {inspection.car.model} ·{" "}
					{inspection.car.city}
				</div>

				{isLoading && (
					<div className="muted-line">Loading inspectors…</div>
				)}
				{!isLoading && candidates.length === 0 && (
					<div className="muted-line">
						No available inspectors in {inspection.car.city}.
					</div>
				)}
				{candidates.map((c) => (
					<InspectorOptionStyled
						key={c.userId}
						$active={pick === c.userId}
						onClick={() => setPick(c.userId)}
					>
						<span>{c.user?.fullName ?? "Unknown"}</span>
						<span className="opt-meta">
							{c.user?.city ?? "—"} · ★{" "}
							{Number(c.rating ?? 0).toFixed(1)}
						</span>
					</InspectorOptionStyled>
				))}

				{error && (
					<div role="alert" className="error-line">
						{error}
					</div>
				)}

				<ModalActionsStyled>
					<Button variant="ghost" size="sm" onClick={onClose}>
						Close
					</Button>
					<Button
						variant="primary"
						size="sm"
						onClick={submit}
						disabled={!pick || busy}
					>
						{busy ? "Reassigning…" : "Reassign"}
					</Button>
				</ModalActionsStyled>
			</ModalCardStyled>
		</ModalStyled>
	);
}
