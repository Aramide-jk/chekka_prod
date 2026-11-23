"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import { Button, Eyebrow, Pill, type PillTone, Select } from "@/components";
import { api, fetcher, getErrorMessage } from "@/constants";
import { PageShell } from "@/layouts";
import type { IResponseEnvelope } from "@/types";
import {
	DisputeDetailStyled,
	EmptyStyled,
	ModalErrStyled,
	ModalFieldStyled,
	ModalStyled,
	OverlayStyled,
	RowMetaStyled,
	RowNameStyled,
	RowStyled,
	SectionStyled,
} from "./styled";

// Mirror of the server's EnrichedDispute payload (see
// server/services/disputes/enrichDisputes.ts) — the admin queue needs the
// resolved party names, not bare ObjectIds.
interface IDisputeParty {
	id: string;
	fullName: string;
	email?: string;
	phone?: string;
	role: string;
}

interface IDisputeDetail {
	id: string;
	statement: string;
	status: "open" | "resolved" | "closed";
	resolution: "buyer" | "inspector" | "closed" | null;
	createdAt: string;
	raisedBy: IDisputeParty | null;
	buyer: IDisputeParty | null;
	inspector: IDisputeParty | null;
	inspection: {
		id: string;
		car: string;
		status: string;
		inspectionType: string;
	} | null;
}

export type QueueKind =
	| "inspectors"
	| "special-requests"
	| "disputes"
	| "broker-requests"
	| "overdue"
	| "live";

interface IProps {
	kind: QueueKind;
}

const COPY: Record<
	QueueKind,
	{ eyebrow: string; title: string; titleEm: string; subtitle: string }
> = {
	inspectors: {
		eyebrow: "Inspector applications",
		title: "Approve",
		titleEm: "inspectors",
		subtitle: "Review documents and approve, reject, or request more info.",
	},
	"special-requests": {
		eyebrow: "Special requests",
		title: "Special",
		titleEm: "requests",
		subtitle:
			"Cars that need a custom inspection — review, assign, and price.",
	},
	disputes: {
		eyebrow: "Disputes",
		title: "Open",
		titleEm: "disputes",
		subtitle:
			"Buyer-reported issues with completed inspections. Resolution window: 48 h.",
	},
	"broker-requests": {
		eyebrow: "Broker requests",
		title: "Broker",
		titleEm: "queue",
		subtitle: "Assign a broker so the buyer can take it from there.",
	},
	overdue: {
		eyebrow: "Overdue reports",
		title: "Overdue",
		titleEm: "reports",
		subtitle:
			"Reports past their 48 h deadline. Remind, reassign, or flag the inspector.",
	},
	live: {
		eyebrow: "Live monitoring",
		title: "Live",
		titleEm: "inspections",
		subtitle: "All inspections currently in progress across Nigeria.",
	},
};

interface IInspectorOption {
	userId: string;
	user?: { fullName?: string; city?: string };
}

function DisputeParty({
	label,
	party,
}: {
	label: string;
	party: IDisputeParty | null;
}) {
	return (
		<div className="dd-section">
			<span className="dd-label">{label}</span>
			<span className="dd-party">{party?.fullName ?? "—"}</span>
			{party && (party.email || party.phone) && (
				<span className="dd-contact">
					{[party.email, party.phone].filter(Boolean).join(" · ")}
				</span>
			)}
		</div>
	);
}

function DisputeModal({
	row,
	onClose,
	onDone,
}: {
	row: IRow;
	onClose: () => void;
	onDone: () => void;
}) {
	const [busy, setBusy] = useState(false);
	const [err, setErr] = useState<string | null>(null);

	async function resolve(resolution: "buyer" | "inspector" | "closed") {
		if (busy) return;
		setBusy(true);
		setErr(null);
		try {
			await api().post(`/api/admin/disputes/${row.id}/resolve`, {
				resolution,
			});
			globalMutate(DISPUTES_KEY);
			onDone();
		} catch (e) {
			setErr(getErrorMessage(e, "Could not resolve dispute"));
			setBusy(false);
		}
	}

	const d = row.disputeDetail;
	const isOpen = (d?.status ?? "open") === "open";
	const resolutionCopy: Record<string, string> = {
		buyer: "Resolved for buyer (refund)",
		inspector: "Upheld report (favoured inspector)",
		closed: "Closed without action",
	};

	return (
		<OverlayStyled
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<ModalStyled>
				<Eyebrow $gold className="modal-eyebrow">
					{isOpen ? "Resolve dispute" : "Dispute details"}
				</Eyebrow>

				<DisputeDetailStyled>
					<div className="dd-section">
						<span className="dd-label">Statement</span>
						<div className="dd-statement">
							{d?.statement ?? row.name}
						</div>
					</div>

					<div className="dd-grid">
						<DisputeParty label="Buyer" party={d?.buyer ?? null} />
						<DisputeParty
							label="Inspector"
							party={d?.inspector ?? null}
						/>
					</div>

					<div className="dd-grid">
						<div className="dd-section">
							<span className="dd-label">Vehicle</span>
							<span className="dd-party">
								{d?.inspection?.car ?? "—"}
							</span>
							{d?.inspection && (
								<span className="dd-contact">
									{d.inspection.inspectionType} ·{" "}
									{d.inspection.status}
								</span>
							)}
						</div>
						<DisputeParty
							label="Raised by"
							party={d?.raisedBy ?? null}
						/>
					</div>

					{!isOpen && (
						<div className="dd-section">
							<span className="dd-label">Outcome</span>
							<span className="dd-party">
								{d?.resolution
									? resolutionCopy[d.resolution]
									: "Resolved"}
							</span>
						</div>
					)}
				</DisputeDetailStyled>

				{err && <ModalErrStyled>{err}</ModalErrStyled>}
				{isOpen ? (
					<div className="resolve-actions">
						<Button
							variant="primary"
							size="md"
							disabled={busy}
							onClick={() => resolve("buyer")}
						>
							Resolve for buyer (refund)
						</Button>
						<Button
							variant="secondary"
							size="md"
							disabled={busy}
							onClick={() => resolve("inspector")}
						>
							Uphold report (favour inspector)
						</Button>
						<Button
							variant="ghost"
							size="md"
							disabled={busy}
							onClick={() => resolve("closed")}
						>
							Close without action
						</Button>
					</div>
				) : (
					<div className="resolve-actions">
						<Button variant="ghost" size="md" onClick={onClose}>
							Close
						</Button>
					</div>
				)}
			</ModalStyled>
		</OverlayStyled>
	);
}

function SpecialRequestModal({
	row,
	onClose,
	onDone,
}: {
	row: IRow;
	onClose: () => void;
	onDone: () => void;
}) {
	const { data } = useSWR<
		IResponseEnvelope<{ inspectors: IInspectorOption[] }>
	>("/api/inspectors?limit=50", fetcher, { revalidateOnMount: true });
	const inspectors = data?.data?.inspectors ?? [];
	const [inspectorId, setInspectorId] = useState("");
	const [price, setPrice] = useState("");
	const [busy, setBusy] = useState(false);
	const [err, setErr] = useState<string | null>(null);

	async function assign() {
		if (busy) return;
		const customPrice = Number(price.replace(/[^0-9]/g, ""));
		if (!inspectorId) {
			setErr("Pick an inspector.");
			return;
		}
		if (!customPrice || customPrice <= 0) {
			setErr("Enter a price.");
			return;
		}
		setBusy(true);
		setErr(null);
		try {
			await api().post(`/api/admin/special-requests/${row.id}/assign`, {
				inspectorId,
				customPrice,
			});
			globalMutate(SR_KEY);
			onDone();
		} catch (e) {
			setErr(getErrorMessage(e, "Could not assign special request"));
			setBusy(false);
		}
	}

	return (
		<OverlayStyled
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<ModalStyled>
				<Eyebrow $gold className="modal-eyebrow">
					Assign special request
				</Eyebrow>
				<p className="modal-subject">{row.name}</p>
				{err && <ModalErrStyled>{err}</ModalErrStyled>}
				<ModalFieldStyled>
					<span>Inspector</span>
					<Select
						ariaLabel="Inspector"
						placeholder="Select an inspector…"
						value={inspectorId}
						onChange={setInspectorId}
						options={inspectors.map((i) => ({
							value: i.userId,
							label: `${i.user?.fullName ?? i.userId}${
								i.user?.city ? ` · ${i.user.city}` : ""
							}`,
						}))}
					/>
				</ModalFieldStyled>
				<ModalFieldStyled>
					<span>Custom price (₦)</span>
					<input
						inputMode="numeric"
						value={price}
						onChange={(e) => setPrice(e.target.value)}
						placeholder="e.g. 75,000"
					/>
				</ModalFieldStyled>
				<div className="assign-actions">
					<Button
						variant="primary"
						size="md"
						fullWidth
						disabled={busy}
						onClick={assign}
					>
						{busy ? "Assigning…" : "Assign & price"}
					</Button>
					<Button variant="secondary" size="md" onClick={onClose}>
						Cancel
					</Button>
				</div>
			</ModalStyled>
		</OverlayStyled>
	);
}

function relTime(d?: string | Date) {
	if (!d) return "—";
	const t = typeof d === "string" ? new Date(d).getTime() : d.getTime();
	const diff = Date.now() - t;
	if (diff < 60_000) return "just now";
	if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
	if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} h ago`;
	return `${Math.floor(diff / 86_400_000)} d ago`;
}

interface IRow {
	id: string;
	name: string;
	city?: string;
	exp?: string;
	since?: string;
	tone: PillTone;
	action?: () => Promise<void>;
	actionLabel?: string;
	// Rows that need extra input open a modal instead of running inline.
	interactive?: "dispute" | "special";
	// Full enriched payload for the dispute modal (parties, vehicle, statement).
	disputeDetail?: IDisputeDetail;
}

const SR_KEY = "/api/admin/special-requests";
const DISPUTES_KEY = "/api/admin/disputes";
const BROKER_KEY = "/api/admin/broker-requests";

function useInspectorsQueue() {
	const { data, mutate } = useSWR<
		IResponseEnvelope<{ applications: Array<Record<string, unknown>> }>
	>("/api/admin/inspectors", fetcher, { revalidateOnMount: true });
	const items = data?.data?.applications ?? [];
	return useMemo<IRow[]>(
		() =>
			items.map((a) => {
				const user = (a.user as Record<string, unknown>) ?? {};
				const userId = String(user._id ?? "");
				return {
					id: userId,
					name: String(user.fullName ?? "Unknown"),
					city: String(user.city ?? ""),
					exp: `${a.yearsExperience ?? 0} yrs`,
					since: relTime(String(a.createdAt ?? "")),
					tone: "gold" as PillTone,
					action: async () => {
						await api().patch(`/api/admin/inspectors/${userId}`, {
							action: "approve",
						});
						mutate();
					},
					actionLabel: "Approve",
				};
			}),
		[items, mutate],
	);
}

function useInspectionsQueue(filter: string, remindable = false) {
	const key = `/api/admin/inspections?${filter}`;
	const { data, mutate } = useSWR<
		IResponseEnvelope<{ inspections: Array<Record<string, unknown>> }>
	>(key, fetcher, { revalidateOnMount: true });
	const items = data?.data?.inspections ?? [];
	return useMemo<IRow[]>(
		() =>
			items.map((i) => {
				const car = (i.car as Record<string, unknown>) ?? {};
				const id = String(i._id ?? "");
				return {
					id,
					name:
						`${car.make ?? ""} ${car.model ?? ""} ${car.year ?? ""}`.trim() ||
						"Inspection",
					city: String(car.city ?? ""),
					exp: String(i.currentSection ?? i.status ?? ""),
					since: `${i.photoCount ?? 0} photos`,
					tone: "gold" as PillTone,
					...(remindable
						? {
								actionLabel: "Remind",
								action: async () => {
									await api().post(
										`/api/admin/inspections/${id}/remind`,
										{},
									);
									mutate();
								},
							}
						: {}),
				};
			}),
		[items, remindable, mutate],
	);
}

function useSpecialRequests() {
	const { data } = useSWR<
		IResponseEnvelope<{ inspections: Array<Record<string, unknown>> }>
	>(`/api/admin/special-requests`, fetcher, { revalidateOnMount: true });
	const items = data?.data?.inspections ?? [];
	return useMemo<IRow[]>(
		() =>
			items.map((i) => {
				const car = (i.car as Record<string, unknown>) ?? {};
				return {
					id: String(i._id ?? ""),
					name:
						`${car.make ?? ""} ${car.model ?? ""} ${car.year ?? ""}`.trim() ||
						"Special request",
					city: String(car.city ?? ""),
					exp: `Buyer ${i.buyerId ?? ""}`,
					since: relTime(String(i.createdAt ?? "")),
					tone: "info" as PillTone,
					interactive: "special" as const,
					actionLabel: "Assign",
				};
			}),
		[items],
	);
}

function useDisputes() {
	const { data } = useSWR<IResponseEnvelope<{ disputes: IDisputeDetail[] }>>(
		DISPUTES_KEY,
		fetcher,
		{ revalidateOnMount: true },
	);
	const items = data?.data?.disputes ?? [];
	return useMemo<IRow[]>(
		() =>
			items.map((d) => {
				const open = d.status === "open";
				return {
					id: d.id,
					name: d.statement || "Dispute",
					city: d.inspection?.car ?? "—",
					exp: `Buyer: ${d.buyer?.fullName ?? "Unknown"} · Inspector: ${
						d.inspector?.fullName ?? "Unassigned"
					}`,
					since: relTime(d.createdAt),
					tone: open ? ("danger" as PillTone) : ("good" as PillTone),
					interactive: "dispute" as const,
					actionLabel: open ? "Resolve" : "View",
					disputeDetail: d,
				};
			}),
		[items],
	);
}

function useBrokerRequests() {
	const { data, mutate } = useSWR<
		IResponseEnvelope<{ requests: Array<Record<string, unknown>> }>
	>(BROKER_KEY, fetcher, { revalidateOnMount: true });
	const items = data?.data?.requests ?? [];
	return useMemo<IRow[]>(
		() =>
			items.map((r) => {
				const id = String(r._id ?? "");
				const assigned = !!r.brokerId;
				return {
					id,
					name: `Broker request`,
					city: String(r.deliveryAddress ?? ""),
					exp: `₦${Number(r.budget ?? 0).toLocaleString()} budget`,
					since: relTime(String(r.createdAt ?? "")),
					tone: assigned
						? ("good" as PillTone)
						: ("info" as PillTone),
					...(assigned
						? {}
						: {
								actionLabel: "Assign to me",
								action: async () => {
									await api().post(
										`/api/admin/broker-requests/${id}/assign`,
										{},
									);
									mutate();
								},
							}),
				};
			}),
		[items, mutate],
	);
}

export default function AdminQueueWrapper({ kind }: IProps) {
	const c = COPY[kind];
	const inspectors = useInspectorsQueue();
	const specialRequests = useSpecialRequests();
	const disputes = useDisputes();
	const brokerRequests = useBrokerRequests();
	const overdue = useInspectionsQueue("filter=overdue", true);
	const liveQueue = useInspectionsQueue("status=in_progress");

	const [liveRealtime, setLiveRealtime] = useState<IRow[]>([]);
	const esRef = useRef<EventSource | null>(null);

	useEffect(() => {
		if (kind !== "live" || typeof window === "undefined") return;
		const es = new EventSource("/api/admin/inspections/live");
		esRef.current = es;
		es.addEventListener("snapshot", (ev) => {
			try {
				const data = JSON.parse((ev as MessageEvent).data) as {
					inspections: Array<Record<string, unknown>>;
				};
				setLiveRealtime(
					data.inspections.map((i) => {
						const car = (i.car as Record<string, unknown>) ?? {};
						return {
							id: String(i._id ?? ""),
							name:
								`${car.make ?? ""} ${car.model ?? ""} ${car.year ?? ""}`.trim() ||
								"Inspection",
							city: String(car.city ?? ""),
							exp: String(i.currentSection ?? "in progress"),
							since: `${i.photoCount ?? 0} photos`,
							tone: "gold" as PillTone,
						};
					}),
				);
			} catch {
				// ignore
			}
		});
		// Incremental deltas (new photo, section change) keep the snapshot live
		// instead of only updating on a full reconnect.
		es.addEventListener("event", (ev) => {
			try {
				const payload = JSON.parse((ev as MessageEvent).data) as Record<
					string,
					unknown
				>;
				const insId = String(payload.inspectionId ?? "");
				if (!insId) return;
				const isPhoto =
					payload.kind === "photo" || payload.type === "photo";
				const isSection =
					payload.kind === "section" || payload.type === "section";
				setLiveRealtime((prev) =>
					prev.map((r) => {
						if (r.id !== insId) return r;
						if (isPhoto) {
							const n = Number.parseInt(r.since ?? "0", 10) || 0;
							return { ...r, since: `${n + 1} photos` };
						}
						if (isSection) {
							return {
								...r,
								exp: String(payload.section ?? r.exp),
							};
						}
						return r;
					}),
				);
			} catch {
				// ignore
			}
		});
		return () => es.close();
	}, [kind]);

	const rows: IRow[] = useMemo(() => {
		if (kind === "inspectors") return inspectors;
		if (kind === "special-requests") return specialRequests;
		if (kind === "disputes") return disputes;
		if (kind === "broker-requests") return brokerRequests;
		if (kind === "overdue") return overdue;
		return liveRealtime.length > 0 ? liveRealtime : liveQueue;
	}, [
		kind,
		inspectors,
		specialRequests,
		disputes,
		brokerRequests,
		overdue,
		liveRealtime,
		liveQueue,
	]);

	const [error, setError] = useState<string | null>(null);
	const [busyId, setBusyId] = useState<string | null>(null);
	const [modalRow, setModalRow] = useState<IRow | null>(null);

	async function runAction(r: IRow) {
		if (r.interactive) {
			setModalRow(r);
			return;
		}
		if (!r.action) return;
		setBusyId(r.id);
		setError(null);
		try {
			await r.action();
		} catch (err) {
			setError(getErrorMessage(err, "Could not complete action"));
		} finally {
			setBusyId(null);
		}
	}

	return (
		<PageShell
			eyebrow={c.eyebrow}
			title={c.title}
			titleEm={c.titleEm}
			navTitle={`Admin · ${kind}`}
			subtitle={c.subtitle}
		>
			<SectionStyled data-testid={`queue-${kind}`}>
				<Eyebrow $gold className="queue-count">
					Open ({rows.length})
				</Eyebrow>
				{rows.length === 0 && (
					<EmptyStyled>Queue is empty.</EmptyStyled>
				)}
				{rows.map((r) => (
					<RowStyled key={r.id || r.name}>
						<RowNameStyled>{r.name}</RowNameStyled>
						<RowMetaStyled>{r.city}</RowMetaStyled>
						<RowMetaStyled>{r.exp}</RowMetaStyled>
						<Pill tone={r.tone}>{r.since}</Pill>
						{r.action || r.interactive ? (
							<Button
								variant="secondary"
								size="sm"
								onClick={() => runAction(r)}
								disabled={busyId === r.id}
							>
								{busyId === r.id
									? "…"
									: (r.actionLabel ?? "Review")}
							</Button>
						) : (
							<Button variant="secondary" size="sm" disabled>
								Review
							</Button>
						)}
					</RowStyled>
				))}
				{error && (
					<div role="alert" className="error-line">
						{error}
					</div>
				)}
			</SectionStyled>

			{modalRow?.interactive === "dispute" && (
				<DisputeModal
					row={modalRow}
					onClose={() => setModalRow(null)}
					onDone={() => setModalRow(null)}
				/>
			)}
			{modalRow?.interactive === "special" && (
				<SpecialRequestModal
					row={modalRow}
					onClose={() => setModalRow(null)}
					onDone={() => setModalRow(null)}
				/>
			)}
		</PageShell>
	);
}
