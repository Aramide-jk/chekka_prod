"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Button, Eyebrow, Icon, Pill, Stars } from "@/components";
import { api, fetcher, getErrorMessage } from "@/constants";
import { PageShell } from "@/layouts";
import type { IResponseEnvelope } from "@/types";
import {
	ActionsStyled,
	BadgeStyled,
	BrokerCopyStyled,
	ChecklistGridStyled,
	CheckStyled,
	ColumnStyled,
	CountStyled,
	CountsStyled,
	FieldLabelStyled,
	GridStyled,
	LifecycleStyled,
	LightboxStyled,
	ModalErrorStyled,
	ModalLinkStyled,
	ModalStyled,
	OverlayStyled,
	PhotoButtonStyled,
	PhotoGridStyled,
	ReportHeaderStyled,
	SectionStyled,
	SectionTitleStyled,
	SpecRowStyled,
	SpecStyled,
	StageRowStyled,
	StageStyled,
	StarPickStyled,
	TabStyled,
	TabsStyled,
	VerdictStyled,
	VerdictTitleStyled,
} from "./styled";

interface IProps {
	id: string;
	// When rendered from a public /share/[nonce] link, the inspection is
	// resolved server-side and passed in directly (the viewer is not
	// authenticated, so the client can't fetch it).
	sharedInspection?: IInspection;
}

interface IChecklistItem {
	label: string;
	status: "good" | "minor" | "serious" | "n/a";
	comment?: string;
}

interface IOverview {
	year?: number;
	make?: string;
	model?: string;
	mileage?: string;
	transmission?: string;
	vin?: string;
	interiorType?: string;
	interiorColor?: string;
	bodyColor?: string;
	engine?: string;
	driveType?: string;
	fuelType?: string;
}

interface IReport {
	overview: IOverview;
	exterior: IChecklistItem[];
	interior: IChecklistItem[];
	mechanical: IChecklistItem[];
	roadTest: IChecklistItem[];
	verdict: "good" | "caution" | "danger";
	summary: {
		passed: number;
		minor: number;
		serious: number;
		written: string;
	};
}

interface IInspector {
	id: string;
	fullName: string;
	avatar?: string;
	city?: string;
	rating?: number;
	totalCompleted?: number;
	badge?: "certified" | "verified" | null;
}

interface IInspection {
	_id: string;
	status:
		| "submitted"
		| "assigned"
		| "scheduled"
		| "in_progress"
		| "report_processing"
		| "completed";
	car: { make: string; model: string; year: number };
	createdAt?: string;
	completedAt?: string;
	report?: IReport;
	photoCount: number;
	inspector?: IInspector | null;
	rating?: { score: number; comment?: string } | null;
	canRate?: boolean;
}

// Overview keys → human labels, in display order (drives the Vehicle Details
// tab and the per-section PDF).
const VEHICLE_FIELDS: Array<[keyof IOverview, string]> = [
	["make", "Make"],
	["model", "Model"],
	["year", "Year"],
	["mileage", "Mileage"],
	["transmission", "Transmission"],
	["vin", "VIN"],
	["interiorType", "Interior type"],
	["interiorColor", "Interior color"],
	["bodyColor", "Body color"],
	["engine", "Engine"],
	["driveType", "Drive type"],
	["fuelType", "Fuel type"],
];

const BADGE_COPY = {
	certified: "Certified Inspector",
	verified: "Verified",
} as const;

const TABS = [
	"Overview",
	"Vehicle Details",
	"Exterior",
	"Interior",
	"Mechanical",
	"Road Test",
	"Photos",
	"Verdict",
] as const;

// Tabs whose contents map onto a report PDF section (Photos has no PDF section).
const PDF_SECTION_TABS: ReadonlySet<string> = new Set([
	"Overview",
	"Vehicle Details",
	"Exterior",
	"Interior",
	"Mechanical",
	"Road Test",
	"Verdict",
]);
const STAGES = [
	{ k: "submitted", label: "Submitted" },
	{ k: "assigned", label: "Assigned" },
	{ k: "scheduled", label: "Scheduled" },
	{ k: "in_progress", label: "In progress" },
	{ k: "report_processing", label: "Report processing" },
	{ k: "completed", label: "Completed" },
] as const;

const SAMPLE_INSPECTION: IInspection = {
	_id: "sample",
	status: "completed",
	car: { make: "Toyota", model: "Camry SE", year: 2018 },
	photoCount: 32,
	completedAt: new Date().toISOString(),
	inspector: {
		id: "sample-inspector",
		fullName: "Adebayo Okonkwo",
		city: "Lagos",
		rating: 4.9,
		totalCompleted: 312,
		badge: "certified",
	},
	report: {
		overview: {
			year: 2018,
			make: "Toyota",
			model: "Camry SE",
			vin: "4T1BF1FK2EU***781",
			mileage: "76,400 km",
			transmission: "Automatic",
			engine: "2.5L I4",
			bodyColor: "Silver",
			interiorColor: "Black",
			interiorType: "Cloth",
			driveType: "FWD",
			fuelType: "Petrol",
		},
		exterior: [
			{ label: "Body alignment", status: "good" },
			{ label: "Paint condition", status: "minor" },
			{ label: "Scratches", status: "minor" },
			{ label: "Dents", status: "good" },
			{ label: "Rust", status: "good" },
			{ label: "Tyres", status: "minor" },
		],
		interior: [
			{ label: "Dashboard", status: "good" },
			{ label: "Seats", status: "good" },
			{ label: "AC", status: "good" },
		],
		mechanical: [
			{ label: "Engine", status: "good" },
			{ label: "Transmission", status: "good" },
			{ label: "Brakes", status: "good" },
		],
		roadTest: [
			{ label: "Starting", status: "good" },
			{ label: "Steering", status: "good" },
		],
		verdict: "good",
		summary: {
			passed: 42,
			minor: 5,
			serious: 1,
			written:
				"The car is in solid mechanical and structural condition. Minor cosmetic items can be remediated within a small budget.",
		},
	},
};

const VERDICT_COPY: Record<IReport["verdict"], string> = {
	good: "Worth Buying",
	caution: "Buy With Caution",
	danger: "Not Recommended",
};

// A single photo tile. Tracks its own load failure so a broken/expired image
// URL degrades to the camera placeholder instead of a broken-image box. Clicking
// opens the lightbox preview.
function PhotoThumb({ url, onOpen }: { url: string; onOpen: () => void }) {
	const [errored, setErrored] = useState(false);
	return (
		<PhotoButtonStyled
			type="button"
			onClick={onOpen}
			aria-label="View inspection photo"
		>
			{errored ? (
				<Icon name="camera" size={20} />
			) : (
				// biome-ignore lint/performance/noImgElement: signed S3 URLs rotate hourly; next/image remote patterns add more friction than the LCP gain on this private report view.
				<img
					src={url}
					alt="Inspection capture"
					onError={() => setErrored(true)}
				/>
			)}
		</PhotoButtonStyled>
	);
}

export default function InspectionWrapper({ id, sharedInspection }: IProps) {
	const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
	const isShared = !!sharedInspection;
	const isSample = id === "sample";
	// Synthetic = no client fetch (static sample or a server-resolved share).
	const isSynthetic = isSample || isShared;
	const readOnly = isShared;

	// Share
	const [shareMsg, setShareMsg] = useState<string | null>(null);
	const [shareBusy, setShareBusy] = useState(false);

	// Mint (or reuse) the public share link for this inspection and return the
	// absolute URL. Shared by the native-share and copy-link actions.
	async function createShareUrl(): Promise<string> {
		const res = await api().post(`/api/inspections/${id}/share`, {});
		const path = res.data?.data?.path as string | undefined;
		return typeof window !== "undefined" && path
			? `${window.location.origin}${path}`
			: (path ?? "");
	}

	async function handleShare() {
		if (shareBusy) return;
		setShareBusy(true);
		try {
			const url = await createShareUrl();
			if (!url) {
				setShareMsg("Could not create share link");
				return;
			}
			const nav = typeof navigator !== "undefined" ? navigator : undefined;
			// Prefer the device's native share sheet (mobile); fall back to the
			// clipboard on desktop browsers without the Web Share API.
			if (nav?.share) {
				try {
					await nav.share({
						title: "Chekka inspection report",
						text: "View this vehicle inspection report on Chekka.",
						url,
					});
				} catch (err) {
					// User dismissed the sheet — not an error.
					if ((err as { name?: string })?.name === "AbortError")
						return;
					if (nav.clipboard?.writeText) {
						await nav.clipboard.writeText(url);
						setShareMsg("Link copied to clipboard");
					}
				}
			} else if (nav?.clipboard?.writeText) {
				await nav.clipboard.writeText(url);
				setShareMsg("Link copied to clipboard");
			} else {
				setShareMsg(url);
			}
		} catch {
			setShareMsg("Could not create share link");
		} finally {
			setShareBusy(false);
			setTimeout(() => setShareMsg(null), 4000);
		}
	}

	async function handleCopyLink() {
		if (shareBusy) return;
		setShareBusy(true);
		try {
			const url = await createShareUrl();
			if (url && navigator?.clipboard?.writeText) {
				await navigator.clipboard.writeText(url);
				setShareMsg("Link copied to clipboard");
			} else {
				setShareMsg(url || "Could not copy link");
			}
		} catch {
			setShareMsg("Could not copy link");
		} finally {
			setShareBusy(false);
			setTimeout(() => setShareMsg(null), 4000);
		}
	}

	// PDF downloads. The authenticated buyer view streams a clean, server-built
	// PDF of just the report (full report, or only the active tab's section) —
	// never the surrounding page chrome (rating, next steps, etc.). Synthetic
	// views (static sample / public share) have no server endpoint, so they fall
	// back to the browser print dialog.
	const [pdfBusy, setPdfBusy] = useState<null | "section" | "full">(null);

	async function downloadPdf(scope: "section" | "full") {
		if (isSynthetic) {
			if (typeof window !== "undefined") window.print();
			return;
		}
		if (pdfBusy) return;
		setPdfBusy(scope);
		try {
			const qs =
				scope === "section"
					? `?section=${encodeURIComponent(tab)}`
					: "";
			const res = await fetch(`/api/inspections/${id}/report-pdf${qs}`, {
				credentials: "include",
			});
			if (!res.ok) throw new Error("pdf");
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download =
				scope === "section"
					? `chekka-${tab.toLowerCase().replace(/\s+/g, "-")}.pdf`
					: "chekka-full-report.pdf";
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} catch {
			setShareMsg("Could not generate PDF");
			setTimeout(() => setShareMsg(null), 4000);
		} finally {
			setPdfBusy(null);
		}
	}

	// Photo lightbox — index into the resolved photo list, or null when closed.
	const [lightbox, setLightbox] = useState<number | null>(null);

	// Dispute / report modal
	const [disputeOpen, setDisputeOpen] = useState(false);
	const [disputeDone, setDisputeDone] = useState(false);
	const [disputeBusy, setDisputeBusy] = useState(false);
	const [disputeError, setDisputeError] = useState<string | null>(null);
	const [disputeText, setDisputeText] = useState("");

	async function submitDispute() {
		if (disputeBusy) return;
		if (disputeText.trim().length < 5) {
			setDisputeError("Please describe the issue (at least a sentence).");
			return;
		}
		setDisputeBusy(true);
		setDisputeError(null);
		try {
			await api().post("/api/disputes", {
				inspectionId: id,
				statement: disputeText.trim(),
			});
			setDisputeDone(true);
		} catch (err) {
			setDisputeError(getErrorMessage(err, "Could not submit dispute"));
		} finally {
			setDisputeBusy(false);
		}
	}

	// Broker request modal
	const [brokerOpen, setBrokerOpen] = useState(false);
	const [brokerDone, setBrokerDone] = useState(false);
	const [brokerBusy, setBrokerBusy] = useState(false);
	const [brokerError, setBrokerError] = useState<string | null>(null);
	const [brokerForm, setBrokerForm] = useState({
		budget: "",
		paymentMethod: "Bank transfer",
		deliveryAddress: "",
		instructions: "",
	});

	async function submitBrokerRequest() {
		if (brokerBusy) return;
		const budget = Number(brokerForm.budget.replace(/[^0-9]/g, ""));
		if (!budget || budget <= 0) {
			setBrokerError("Enter your budget.");
			return;
		}
		if (!brokerForm.deliveryAddress.trim()) {
			setBrokerError("Enter a delivery address.");
			return;
		}
		setBrokerBusy(true);
		setBrokerError(null);
		try {
			await api().post("/api/broker-requests", {
				inspectionId: id,
				budget,
				paymentMethod:
					brokerForm.paymentMethod.trim() || "Bank transfer",
				deliveryAddress: brokerForm.deliveryAddress.trim(),
				instructions: brokerForm.instructions.trim() || undefined,
			});
			setBrokerDone(true);
		} catch (err) {
			setBrokerError(
				getErrorMessage(err, "Could not submit broker request"),
			);
		} finally {
			setBrokerBusy(false);
		}
	}

	const { data, mutate: mutateInspection } = useSWR<
		IResponseEnvelope<{ inspection: IInspection }>
	>(isSynthetic ? null : `/api/inspections/${id}`, fetcher, {
		revalidateOnMount: true,
	});

	// Inspector rating
	const [ratingScore, setRatingScore] = useState(0);
	const [ratingComment, setRatingComment] = useState("");
	const [ratingBusy, setRatingBusy] = useState(false);
	const [ratingError, setRatingError] = useState<string | null>(null);

	async function submitRating() {
		if (ratingBusy || ratingScore < 1) {
			setRatingError("Tap a star to rate first.");
			return;
		}
		setRatingBusy(true);
		setRatingError(null);
		try {
			await api().post(`/api/inspections/${id}/rating`, {
				score: ratingScore,
				comment: ratingComment.trim() || undefined,
			});
			await mutateInspection();
		} catch (err) {
			setRatingError(getErrorMessage(err, "Could not submit rating"));
		} finally {
			setRatingBusy(false);
		}
	}

	// The actual inspection photos (live-captured by the inspector). The report
	// document only stores a count; the images themselves come from this
	// endpoint, which resolves each stored S3 key to a viewer-ready URL.
	const { data: photoData } = useSWR<
		IResponseEnvelope<{ photos: Array<{ _id: string; url: string }> }>
	>(isSynthetic ? null : `/api/inspections/${id}/photos`, fetcher, {
		revalidateOnMount: true,
	});
	const photos = photoData?.data?.photos ?? [];

	// Lightbox keyboard controls: Esc to close, ←/→ to navigate.
	useEffect(() => {
		if (lightbox === null) return;
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") setLightbox(null);
			else if (e.key === "ArrowRight")
				setLightbox((i) => (i === null ? i : (i + 1) % photos.length));
			else if (e.key === "ArrowLeft")
				setLightbox((i) =>
					i === null ? i : (i - 1 + photos.length) % photos.length,
				);
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [lightbox, photos.length]);

	const inspection: IInspection | undefined = isShared
		? sharedInspection
		: isSample
			? SAMPLE_INSPECTION
			: data?.data?.inspection;

	const stages = useMemo(
		() =>
			STAGES.findIndex(
				(s) => s.k === (inspection?.status ?? "submitted"),
			),
		[inspection?.status],
	);

	const car = inspection?.car
		? `${inspection.car.make} ${inspection.car.model}`
		: "Inspection";
	const year = inspection?.car?.year ?? "";
	const report = inspection?.report;
	const verdict = report?.verdict ?? "good";

	const subtitle = inspection
		? inspection.status === "completed"
			? `Completed ${new Date(inspection.completedAt ?? Date.now()).toLocaleDateString()} · Verdict: ${VERDICT_COPY[verdict]}`
			: `Status: ${inspection.status.replace(/_/g, " ")}`
		: "Loading inspection…";

	return (
		<PageShell
			eyebrow={`Inspection · ${id}`}
			title={car}
			titleEm={String(year)}
			navTitle={`Inspection ${id}`}
			subtitle={subtitle}
			right={
				<ActionsStyled>
					{shareMsg && <span className="share-msg">{shareMsg}</span>}
					{isSynthetic ? (
						<Button
							variant="secondary"
							size="sm"
							icon="download"
							onClick={() => downloadPdf("full")}
						>
							Download PDF
						</Button>
					) : (
						<>
							{PDF_SECTION_TABS.has(tab) && (
								<Button
									variant="secondary"
									size="sm"
									icon="download"
									onClick={() => downloadPdf("section")}
									disabled={pdfBusy !== null}
								>
									{pdfBusy === "section"
										? "Preparing…"
										: "Download Current Section (PDF)"}
								</Button>
							)}
							<Button
								variant="primary"
								size="sm"
								icon="download"
								onClick={() => downloadPdf("full")}
								disabled={pdfBusy !== null}
							>
								{pdfBusy === "full"
									? "Preparing…"
									: "Download Full Report (PDF)"}
							</Button>
							<Button
								variant="secondary"
								size="sm"
								icon="share"
								onClick={handleShare}
								disabled={shareBusy}
							>
								Share
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleCopyLink}
								disabled={shareBusy}
							>
								Copy link
							</Button>
						</>
					)}
				</ActionsStyled>
			}
		>
			<ReportHeaderStyled>
				<div className="ins-avatar">
					{inspection?.inspector?.avatar ? (
						// biome-ignore lint/performance/noImgElement: signed S3 avatar URLs rotate; next/image remote patterns add friction for little gain on this private view.
						<img
							src={inspection.inspector.avatar}
							alt={inspection.inspector.fullName}
						/>
					) : (
						(inspection?.inspector?.fullName ?? "?")
							.charAt(0)
							.toUpperCase()
					)}
				</div>
				<div className="ins-head">
					<div className="ins-title">Vehicle Inspection Report</div>
					<div className="ins-name">
						{inspection?.inspector?.fullName ??
							"Awaiting inspector assignment"}
					</div>
					<div className="ins-meta">
						{[
							inspection?.inspector?.badge
								? BADGE_COPY[inspection.inspector.badge]
								: null,
							inspection?.inspector?.city,
							inspection?.inspector?.rating
								? `★ ${inspection.inspector.rating}`
								: null,
							inspection?.inspector?.totalCompleted != null
								? `${inspection.inspector.totalCompleted} inspections`
								: null,
						]
							.filter(Boolean)
							.join("  ·  ") || "Certified Chekka inspector"}
					</div>
				</div>
				{inspection?.inspector?.badge && (
					<BadgeStyled
						$certified={inspection.inspector.badge === "certified"}
					>
						<Icon name="check" size={12} />
						{BADGE_COPY[inspection.inspector.badge]}
					</BadgeStyled>
				)}
			</ReportHeaderStyled>

			<LifecycleStyled>
				<Eyebrow $gold className="lifecycle-label">
					Lifecycle
				</Eyebrow>
				<StageRowStyled>
					{STAGES.map((s, idx) => (
						<StageStyled
							key={s.k}
							$on={idx === stages}
							$done={idx < stages}
						>
							{s.label}
						</StageStyled>
					))}
				</StageRowStyled>
				{inspection?.status === "in_progress" && (
					<div className="lifecycle-live">
						<Link href={`/inspections/${inspection._id}/live`}>
							<Button
								variant="primary"
								size="sm"
								iconRight="chevron-right"
							>
								Watch live feed
							</Button>
						</Link>
					</div>
				)}
			</LifecycleStyled>

			<TabsStyled data-testid="inspection-tabs">
				{TABS.map((t) => (
					<TabStyled
						key={t}
						$on={tab === t}
						onClick={() => setTab(t)}
						type="button"
					>
						{t}
					</TabStyled>
				))}
			</TabsStyled>

			<GridStyled>
				<ColumnStyled>
					{tab === "Overview" && (
						<SectionStyled>
							<SectionTitleStyled>Overview</SectionTitleStyled>
							{report?.summary ? (
								<>
									<CountsStyled>
										<CountStyled $tone="good">
											<Eyebrow className="count-label">
												Passed
											</Eyebrow>
											<div className="count-num">
												{report.summary.passed}
											</div>
										</CountStyled>
										<CountStyled $tone="caution">
											<Eyebrow className="count-label">
												Minor
											</Eyebrow>
											<div className="count-num">
												{report.summary.minor}
											</div>
										</CountStyled>
										<CountStyled $tone="danger">
											<Eyebrow className="count-label">
												Serious
											</Eyebrow>
											<div className="count-num">
												{report.summary.serious}
											</div>
										</CountStyled>
									</CountsStyled>
									{report.summary.written && (
										<p
											className="muted-note"
											style={{ marginTop: 16 }}
										>
											{report.summary.written}
										</p>
									)}
								</>
							) : (
								<p className="muted-note">
									A summary will appear once the report is
									filed.
								</p>
							)}
						</SectionStyled>
					)}

					{tab === "Vehicle Details" && (
						<SectionStyled>
							<SectionTitleStyled>
								Vehicle Details
							</SectionTitleStyled>
							{report?.overview &&
							VEHICLE_FIELDS.some(
								([k]) =>
									report.overview[k] != null &&
									report.overview[k] !== "",
							) ? (
								<SpecStyled>
									{VEHICLE_FIELDS.map(([k, label]) => {
										const v = report.overview[k];
										return v == null || v === "" ? null : (
											<SpecRowStyled key={k}>
												<span>{label}</span>
												<span>{String(v)}</span>
											</SpecRowStyled>
										);
									})}
								</SpecStyled>
							) : (
								<p className="muted-note">
									Vehicle details will appear once the report
									is filed.
								</p>
							)}
						</SectionStyled>
					)}

					{tab !== "Overview" &&
						tab !== "Vehicle Details" &&
						tab !== "Photos" &&
						tab !== "Verdict" && (
							<SectionStyled>
								<SectionTitleStyled>{tab}</SectionTitleStyled>
								<ChecklistGridStyled>
									{(
										((
											report as
												| Record<string, unknown>
												| undefined
										)?.[
											tab === "Road Test"
												? "roadTest"
												: tab.toLowerCase()
										] as IChecklistItem[] | undefined) ?? []
									).map((c) => (
										<CheckStyled
											key={c.label}
											$status={c.status}
										>
											<span>{c.label}</span>
											<Pill
												tone={
													c.status === "good"
														? "good"
														: c.status === "minor"
															? "caution"
															: c.status ===
																	"serious"
																? "danger"
																: "ghost"
												}
											>
												{c.status}
											</Pill>
										</CheckStyled>
									))}
								</ChecklistGridStyled>
							</SectionStyled>
						)}

					{tab === "Photos" && (
						<SectionStyled>
							<SectionTitleStyled>Photos</SectionTitleStyled>
							{photos.length === 0 ? (
								<p className="muted-note">
									{(inspection?.photoCount ?? 0) > 0
										? "Loading photos…"
										: "Photos will appear here as the inspector captures them."}
								</p>
							) : (
								<PhotoGridStyled>
									{photos.map((p, i) =>
										p.url ? (
											<PhotoThumb
												key={p._id}
												url={p.url}
												onOpen={() => setLightbox(i)}
											/>
										) : (
											<PhotoButtonStyled
												key={p._id}
												type="button"
												disabled
											>
												<Icon name="camera" size={20} />
											</PhotoButtonStyled>
										),
									)}
								</PhotoGridStyled>
							)}
						</SectionStyled>
					)}

					{tab === "Verdict" && (
						<VerdictStyled $tone={verdict}>
							<Eyebrow className="verdict-label">Verdict</Eyebrow>
							<VerdictTitleStyled $tone={verdict}>
								{VERDICT_COPY[verdict]}
							</VerdictTitleStyled>
							<p className="verdict-written">
								{report?.summary?.written ??
									"This report has not yet been filed by the inspector."}
							</p>
						</VerdictStyled>
					)}
				</ColumnStyled>

				<ColumnStyled>
					<SectionStyled>
						<Eyebrow $gold className="inspector-label">
							Inspector
						</Eyebrow>
						<div className="inspector-name">
							{inspection?.inspector?.fullName ??
								"Awaiting assignment"}
						</div>
						<div className="inspector-sub">
							{inspection?.inspector
								? "Your certified Chekka inspector for this job."
								: "We'll assign a certified inspector shortly."}
						</div>

						{/* Rating — the picker only renders when the server has
						    confirmed this viewer may rate (owning buyer, completed
						    job, inspector assigned, not yet rated). That keeps the
						    POST from ever 403-ing for inspector/admin/consultant
						    viewers who can also reach this report. */}
						{!readOnly &&
							!isSample &&
							(inspection?.rating ? (
								<div className="rating-block">
									<div className="rating-heading">
										Your rating
									</div>
									<Stars rating={inspection.rating.score} />
									{inspection.rating.comment && (
										<p className="rating-comment">
											"{inspection.rating.comment}"
										</p>
									)}
								</div>
							) : inspection?.canRate ? (
								<div className="rating-block">
									<div className="rating-heading-pick">
										Rate your inspector
									</div>
									<StarPickStyled>
										{[1, 2, 3, 4, 5].map((n) => (
											<button
												key={n}
												type="button"
												aria-label={`${n} star${n > 1 ? "s" : ""}`}
												onClick={() =>
													setRatingScore(n)
												}
											>
												<Icon
													name={
														n <= ratingScore
															? "star"
															: "star-outline"
													}
													size={22}
												/>
											</button>
										))}
									</StarPickStyled>
									<textarea
										value={ratingComment}
										onChange={(e) =>
											setRatingComment(e.target.value)
										}
										placeholder="Optional: how did it go?"
										rows={2}
										className="rating-input"
									/>
									{ratingError && (
										<div className="rating-error">
											{ratingError}
										</div>
									)}
									<Button
										variant="primary"
										size="sm"
										fullWidth
										icon="star"
										disabled={ratingBusy}
										onClick={submitRating}
										className="rating-submit"
									>
										{ratingBusy
											? "Submitting…"
											: "Submit rating"}
									</Button>
								</div>
							) : null)}
					</SectionStyled>

					{!readOnly && (
						<SectionStyled>
							<Eyebrow $gold className="next-steps-label">
								Next steps
							</Eyebrow>
							<div className="next-steps">
								<Link href="/book">
									<Button
										variant="secondary"
										size="sm"
										fullWidth
										icon="plus"
									>
										Book another
									</Button>
								</Link>
								<Button
									variant="primary"
									size="sm"
									fullWidth
									icon="briefcase"
									onClick={() => {
										setBrokerDone(false);
										setBrokerError(null);
										setBrokerOpen(true);
									}}
								>
									Talk to a broker
								</Button>
								<Button
									variant="secondary"
									size="sm"
									fullWidth
									icon="warning"
									onClick={() => {
										setDisputeDone(false);
										setDisputeError(null);
										setDisputeOpen(true);
									}}
								>
									Dispute / Report
								</Button>
							</div>
						</SectionStyled>
					)}
				</ColumnStyled>
			</GridStyled>

			{lightbox !== null && photos[lightbox]?.url && (
				<LightboxStyled
					onClick={(e) => {
						if (e.target === e.currentTarget) setLightbox(null);
					}}
				>
					{/* biome-ignore lint/performance/noImgElement: signed S3 URLs rotate hourly; next/image adds friction for this private preview. */}
					<img
						src={photos[lightbox].url}
						alt={`Inspection capture ${lightbox + 1}`}
					/>
					<button
						type="button"
						className="lb-close"
						aria-label="Close preview"
						onClick={() => setLightbox(null)}
					>
						<Icon name="x" size={18} />
					</button>
					{photos.length > 1 && (
						<>
							<button
								type="button"
								className="lb-prev"
								aria-label="Previous photo"
								onClick={() =>
									setLightbox((i) =>
										i === null
											? i
											: (i - 1 + photos.length) %
												photos.length,
									)
								}
							>
								<Icon name="chevron-left" size={18} />
							</button>
							<button
								type="button"
								className="lb-next"
								aria-label="Next photo"
								onClick={() =>
									setLightbox((i) =>
										i === null
											? i
											: (i + 1) % photos.length,
									)
								}
							>
								<Icon name="chevron-right" size={18} />
							</button>
							<div className="lb-count">
								{lightbox + 1} / {photos.length}
							</div>
						</>
					)}
				</LightboxStyled>
			)}

			{brokerOpen && (
				<OverlayStyled
					onClick={(e) => {
						if (e.target === e.currentTarget) setBrokerOpen(false);
					}}
				>
					<ModalStyled>
						<Eyebrow $gold className="modal-label">
							Chekka Broker Service
						</Eyebrow>
						{brokerDone ? (
							<>
								<BrokerCopyStyled>
									Your broker request is in. A Chekka broker
									will be assigned shortly and will reach out
									in your chat to negotiate the price,
									coordinate payment, and arrange delivery.
								</BrokerCopyStyled>
								<div className="modal-actions">
									<ModalLinkStyled href="/chat">
										<Button
											variant="primary"
											size="md"
											fullWidth
										>
											Open chat
										</Button>
									</ModalLinkStyled>
									<Button
										variant="secondary"
										size="md"
										onClick={() => setBrokerOpen(false)}
									>
										Close
									</Button>
								</div>
							</>
						) : (
							<>
								<BrokerCopyStyled>
									You've seen the report. Now let a Chekka
									broker take it from here — negotiate the
									price with the seller, coordinate your
									payment securely, and arrange delivery of
									the car straight to your door. You don't
									have to meet the seller, travel to the car,
									or handle a single kobo directly. A small
									brokerage fee applies.
								</BrokerCopyStyled>
								<FieldLabelStyled>
									<span>Your budget (₦)</span>
									<input
										inputMode="numeric"
										value={brokerForm.budget}
										onChange={(e) =>
											setBrokerForm((f) => ({
												...f,
												budget: e.target.value,
											}))
										}
										placeholder="e.g. 8,500,000"
									/>
								</FieldLabelStyled>
								<FieldLabelStyled>
									<span>Preferred payment method</span>
									<input
										value={brokerForm.paymentMethod}
										onChange={(e) =>
											setBrokerForm((f) => ({
												...f,
												paymentMethod: e.target.value,
											}))
										}
										placeholder="Bank transfer"
									/>
								</FieldLabelStyled>
								<FieldLabelStyled>
									<span>Delivery address</span>
									<input
										value={brokerForm.deliveryAddress}
										onChange={(e) =>
											setBrokerForm((f) => ({
												...f,
												deliveryAddress: e.target.value,
											}))
										}
										placeholder="Where should we deliver the car?"
									/>
								</FieldLabelStyled>
								<FieldLabelStyled>
									<span>Special instructions (optional)</span>
									<textarea
										rows={3}
										value={brokerForm.instructions}
										onChange={(e) =>
											setBrokerForm((f) => ({
												...f,
												instructions: e.target.value,
											}))
										}
										placeholder="Anything the broker should know…"
									/>
								</FieldLabelStyled>
								{brokerError && (
									<ModalErrorStyled>
										{brokerError}
									</ModalErrorStyled>
								)}
								<div className="modal-actions">
									<Button
										variant="primary"
										size="md"
										fullWidth
										disabled={brokerBusy}
										onClick={submitBrokerRequest}
									>
										{brokerBusy
											? "Submitting…"
											: "Connect me with a broker"}
									</Button>
									<Button
										variant="secondary"
										size="md"
										onClick={() => setBrokerOpen(false)}
									>
										No thanks
									</Button>
								</div>
							</>
						)}
					</ModalStyled>
				</OverlayStyled>
			)}

			{disputeOpen && (
				<OverlayStyled
					onClick={(e) => {
						if (e.target === e.currentTarget) setDisputeOpen(false);
					}}
				>
					<ModalStyled>
						<Eyebrow $gold className="modal-label">
							Dispute / Report
						</Eyebrow>
						{disputeDone ? (
							<>
								<BrokerCopyStyled>
									Thanks — your dispute has been logged. A
									Chekka admin will review the report and
									follow up with you. You can track updates in
									your notifications.
								</BrokerCopyStyled>
								<Button
									variant="primary"
									size="md"
									fullWidth
									onClick={() => setDisputeOpen(false)}
								>
									Close
								</Button>
							</>
						) : (
							<>
								<BrokerCopyStyled>
									Something wrong with this inspection or
									report? Tell us what happened and our team
									will investigate. Disputes are handled by
									Chekka admin, not the inspector.
								</BrokerCopyStyled>
								<FieldLabelStyled>
									<span>What's the issue?</span>
									<textarea
										rows={5}
										value={disputeText}
										onChange={(e) =>
											setDisputeText(e.target.value)
										}
										placeholder="Describe the problem with the inspection or report…"
									/>
								</FieldLabelStyled>
								{disputeError && (
									<ModalErrorStyled>
										{disputeError}
									</ModalErrorStyled>
								)}
								<div className="modal-actions">
									<Button
										variant="primary"
										size="md"
										fullWidth
										disabled={disputeBusy}
										onClick={submitDispute}
									>
										{disputeBusy
											? "Submitting…"
											: "Submit dispute"}
									</Button>
									<Button
										variant="secondary"
										size="md"
										onClick={() => setDisputeOpen(false)}
									>
										Cancel
									</Button>
								</div>
							</>
						)}
					</ModalStyled>
				</OverlayStyled>
			)}
		</PageShell>
	);
}
