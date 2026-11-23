"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { Button, Eyebrow, Icon, Pill } from "@/components";
import { api, fetcher } from "@/constants";
import { PageShell } from "@/layouts";
import type { IResponseEnvelope } from "@/types";
import {
	AcceptedStyled,
	ActionsStyled,
	CountdownStyled,
	GridStyled,
	LeftColStyled,
	RightColStyled,
	SectionStyled,
	SpecRowStyled,
	SpecStyled,
} from "./styled";

interface IInspection {
	_id: string;
	status: string;
	urgent?: boolean;
	car: {
		make: string;
		model: string;
		year: number;
		sellerType?: string;
		sellerContact?: string;
		address?: string;
		city?: string;
	};
	buyerContact?: { name?: string; phone?: string };
	scheduledFor?: string;
	slot?: string;
	price: number;
	platformFee: number;
	assignedAt?: string;
	createdAt?: string;
	acceptedAt?: string;
	sellerContactedAt?: string;
	reportLockedAt?: string;
}

interface IProps {
	id: string;
	// Runtime-config slice resolved server-side from /admin/settings — drives
	// the accept-window countdown, payout percentage, and copy on this page.
	acceptWindowMinutes: number;
	sellerContactWindowHours: number;
	reportDeadlineHours: number;
	inspectorPayoutPercent: number;
}

function fmtCountdown(ms: number) {
	const mins = Math.max(0, Math.floor(ms / 60_000));
	const secs = Math.max(0, Math.floor((ms % 60_000) / 1000));
	return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function JobDetailWrapper({
	id,
	acceptWindowMinutes,
	sellerContactWindowHours,
	reportDeadlineHours,
	inspectorPayoutPercent,
}: IProps) {
	const router = useRouter();
	const { data, mutate } = useSWR<
		IResponseEnvelope<{ inspection: IInspection }>
	>(`/api/inspections/${id}`, fetcher, { revalidateOnMount: true });
	const ins = data?.data?.inspection;
	// The report is filed once the inspection is completed / locked. Note that
	// `report_processing` is *before* the report is filed (physical visit done,
	// report form not yet submitted) — the inspector still needs Submit there.
	const reportSubmitted =
		!!ins && (ins.status === "completed" || !!ins.reportLockedAt);
	const [now, setNow] = useState(() => Date.now());
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		const t = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(t);
	}, []);

	const acceptWindowMs = acceptWindowMinutes * 60_000;
	// The accept window runs from when the job was offered to this inspector
	// (assignedAt), not from the appointment time (scheduledFor).
	const offeredAt = ins?.assignedAt ?? ins?.createdAt;
	const deadlineMs = offeredAt
		? new Date(offeredAt).getTime() + acceptWindowMs
		: null;
	const remaining = deadlineMs ? deadlineMs - now : acceptWindowMs;
	const payoutFraction = inspectorPayoutPercent / 100;

	async function patchStatus(patch: Record<string, unknown>) {
		if (busy || !ins) return;
		setBusy(true);
		try {
			await api().patch(`/api/inspections/${ins._id}`, patch);
			mutate();
		} finally {
			setBusy(false);
		}
	}

	async function decline() {
		if (busy || !ins) return;
		if (
			typeof window !== "undefined" &&
			!window.confirm(
				"Decline this job? It will go back into the pool for reassignment.",
			)
		) {
			return;
		}
		setBusy(true);
		try {
			await api().patch(`/api/inspections/${ins._id}`, {
				status: "declined",
			});
			router.push("/inspector/dashboard");
		} finally {
			setBusy(false);
		}
	}

	const car = ins?.car ?? { make: "", model: "", year: 0 };
	const title = ins ? `${car.make} ${car.model}` : "Job";

	return (
		<PageShell
			eyebrow={`Job · ${id}`}
			title={title}
			titleEm={String(car.year || "")}
			navTitle={`Job ${id}`}
			subtitle={`Accept the job within ${acceptWindowMinutes} minutes. Then contact the seller within ${sellerContactWindowHours} hours.`}
		>
			<GridStyled>
				<LeftColStyled>
					<SectionStyled>
						<Eyebrow $gold className="eyebrow-14">
							Car details
						</Eyebrow>
						<SpecStyled>
							{[
								["Year", String(car.year || "")],
								["Make", car.make || ""],
								["Model", car.model || ""],
								["Address", ins?.car.address ?? ""],
							].map(([k, v]) => (
								<SpecRowStyled key={k}>
									<span>{k}</span>
									<span>{v}</span>
								</SpecRowStyled>
							))}
						</SpecStyled>
					</SectionStyled>

					<SectionStyled>
						<Eyebrow $gold className="eyebrow-14">
							Seller
						</Eyebrow>
						{/* Seller PII is revealed only after the inspector
						    accepts the job — before that it stays hidden. */}
						{!ins?.acceptedAt ? (
							<div className="seller-pending">
								Contact details will appear once you accept.
							</div>
						) : ins.car.sellerContact ? (
							<>
								<div className="seller-contact">
									{ins.car.sellerContact}
								</div>
								<div className="seller-sub">
									{ins.car.sellerType === "dealership"
										? "Dealership"
										: "Private seller"}{" "}
									· {ins.car.address ?? ins.car.city ?? ""}
								</div>
							</>
						) : (
							<div className="seller-none">
								No seller phone was provided at booking — reach
								the buyer below to coordinate access.
							</div>
						)}
						{ins?.acceptedAt && (
							<div className="seller-actions">
								{ins.car.sellerContact && (
									<a href={`tel:${ins.car.sellerContact}`}>
										<Button
											variant="primary"
											size="sm"
											icon="phone"
										>
											Call seller
										</Button>
									</a>
								)}
								<Button
									variant="secondary"
									size="sm"
									icon="check"
									disabled={
										!ins || !!ins.sellerContactedAt || busy
									}
									onClick={() =>
										patchStatus({
											sellerContactedAt:
												new Date().toISOString(),
										})
									}
								>
									{ins.sellerContactedAt
										? "Contacted ✓"
										: "Mark contacted"}
								</Button>
							</div>
						)}
					</SectionStyled>

					{ins?.acceptedAt && ins.buyerContact?.phone && (
						<SectionStyled>
							<Eyebrow $gold className="eyebrow-14">
								Buyer
							</Eyebrow>
							<div className="buyer-name">
								{ins.buyerContact.name ?? "Buyer"}
							</div>
							<div className="buyer-phone">
								{ins.buyerContact.phone}
							</div>
							<a href={`tel:${ins.buyerContact.phone}`}>
								<Button
									variant="secondary"
									size="sm"
									icon="phone"
								>
									Call buyer
								</Button>
							</a>
						</SectionStyled>
					)}
				</LeftColStyled>

				<RightColStyled>
					{/* The accept-window countdown is only meaningful before the
					    inspector accepts. Once accepted it stops and is replaced
					    with an "Accepted" confirmation. While the job is still
					    loading (ins undefined) we keep showing the countdown. */}
					{!ins?.acceptedAt ? (
						<CountdownStyled data-testid="countdown">
							<Eyebrow className="countdown-eyebrow">
								Accept window
							</Eyebrow>
							<div className="countdown-value">
								{fmtCountdown(remaining)}
							</div>
						</CountdownStyled>
					) : ins?.acceptedAt ? (
						<AcceptedStyled data-testid="accepted-banner">
							<Eyebrow className="accepted-eyebrow">
								Job accepted
							</Eyebrow>
							<div className="accepted-sub">
								Contact the seller, then start the inspection.
							</div>
						</AcceptedStyled>
					) : null}

					<SectionStyled>
						<Eyebrow $gold className="eyebrow-12">
							Schedule
						</Eyebrow>
						<div className="schedule-line">
							<Icon name="calendar" size={14} />{" "}
							{ins?.scheduledFor
								? `${new Date(ins.scheduledFor).toLocaleDateString()} · ${ins.slot ?? ""}`
								: "Not scheduled"}
						</div>
					</SectionStyled>

					<SectionStyled>
						<Eyebrow $gold className="eyebrow-12">
							Payout
						</Eyebrow>
						<div className="payout-value">
							₦
							{ins
								? Math.floor(
										ins.price * payoutFraction,
									).toLocaleString()
								: "—"}
						</div>
						<Pill tone="ghost" className="payout-pill">
							Held {reportDeadlineHours} h after submit
						</Pill>
					</SectionStyled>

					<ActionsStyled>
						{ins &&
							!ins.acceptedAt &&
							ins.status !== "declined" && (
								<>
									<Button
										variant="primary"
										size="md"
										fullWidth
										icon="check"
										disabled={busy}
										onClick={() =>
											patchStatus({
												acceptedAt:
													new Date().toISOString(),
												status: "scheduled",
											})
										}
									>
										Accept job
									</Button>
									<Button
										variant="secondary"
										size="md"
										fullWidth
										icon="x"
										disabled={busy}
										onClick={decline}
									>
										Decline job
									</Button>
								</>
							)}
						{/* Once the report is submitted (locked / completed /
						    under review) the job is done from the inspector's
						    side — the Start and Submit actions are replaced by a
						    single read-only "View report". */}
						{ins?.acceptedAt && reportSubmitted && (
							<Link href={`/inspections/${id}`}>
								<Button
									variant="primary"
									size="md"
									fullWidth
									iconRight="chevron-right"
								>
									View report
								</Button>
							</Link>
						)}

						{ins?.acceptedAt && !reportSubmitted && (
							<>
								{/* The inspection can't begin until the seller has
								    been contacted and the visit coordinated. */}
								{ins.sellerContactedAt ? (
									<Button
										variant="primary"
										size="md"
										fullWidth
										iconRight="chevron-right"
										disabled={busy}
										onClick={async () => {
											// Flip to in_progress immediately so
											// the buyer's dashboard reflects
											// "In Progress" the moment the
											// inspector starts.
											if (ins.status !== "in_progress") {
												await patchStatus({
													status: "in_progress",
													startedAt:
														new Date().toISOString(),
												});
											}
											router.push(
												`/inspector/inspections/${id}/live`,
											);
										}}
									>
										Start inspection
									</Button>
								) : (
									<>
										<Button
											variant="primary"
											size="md"
											fullWidth
											iconRight="chevron-right"
											disabled
											title="Mark the seller as contacted first"
										>
											Start inspection
										</Button>
										<div className="unlock-hint">
											Mark the seller as contacted to
											unlock.
										</div>
									</>
								)}
								<Link
									href={`/inspector/inspections/${id}/report`}
								>
									<Button
										variant="secondary"
										size="md"
										fullWidth
										icon="edit"
									>
										Submit report
									</Button>
								</Link>
							</>
						)}
					</ActionsStyled>
				</RightColStyled>
			</GridStyled>
		</PageShell>
	);
}
