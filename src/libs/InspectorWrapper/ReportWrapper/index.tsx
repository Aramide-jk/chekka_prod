"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { Button, Eyebrow, Pill } from "@/components";
import { api, fetcher, getErrorMessage } from "@/constants";
import { PageShell } from "@/layouts";
import type { IResponseEnvelope } from "@/types";
import {
	CommentInputStyled,
	ErrorBoxStyled,
	ItemRowStyled,
	ItemWrapStyled,
	SectionStyled,
	StatusBtnStyled,
	StatusBtnsStyled,
	SummaryInputStyled,
	TabStyled,
	TabsStyled,
	VehicleFieldStyled,
	VehicleGridStyled,
	VerdictButtonStyled,
} from "./styled";

interface IProps {
	id: string;
}

type Status = "good" | "minor" | "serious" | "n/a";

interface IChecklistItem {
	label: string;
	status: Status;
	comment?: string;
}

interface IInspection {
	_id: string;
	status: string;
	reportLockedAt?: string;
	car: { make: string; model: string; year: number };
}

const DEFAULT_SECTIONS: Record<string, string[]> = {
	Exterior: [
		"Body alignment",
		"Paint",
		"Scratches",
		"Dents",
		"Rust",
		"Tyres",
	],
	Interior: ["Dashboard", "Seats", "AC", "Infotainment", "Locks"],
	Mechanical: [
		"Engine",
		"Oil",
		"Cooling",
		"Battery",
		"Brakes",
		"Transmission",
	],
	"Road Test": ["Starting", "Steering", "Braking", "OBD2"],
};
type SectionKey = keyof typeof DEFAULT_SECTIONS;
const _SECTION_KEY_MAP: Record<
	SectionKey,
	"exterior" | "interior" | "mechanical" | "roadTest"
> = {
	Exterior: "exterior",
	Interior: "interior",
	Mechanical: "mechanical",
	"Road Test": "roadTest",
};

const STATUSES: Status[] = ["good", "minor", "serious", "n/a"];

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

// Free-text vehicle-detail fields, in display order (year/make/model are
// prefilled from the booking and shown here for confirmation/edit).
const VEHICLE_TEXT_FIELDS: Array<[keyof IOverview, string]> = [
	["make", "Make"],
	["model", "Model"],
	["mileage", "Mileage"],
	["transmission", "Transmission"],
	["vin", "VIN number"],
	["interiorType", "Interior type"],
	["interiorColor", "Interior color"],
	["bodyColor", "Body color"],
	["engine", "Engine"],
	["driveType", "Drive type"],
	["fuelType", "Fuel type"],
];

function buildInitialReport() {
	const out: Record<string, IChecklistItem[]> = {};
	for (const k of Object.keys(DEFAULT_SECTIONS)) {
		out[k] = DEFAULT_SECTIONS[k as SectionKey].map((label) => ({
			label,
			status: "good",
		}));
	}
	return out;
}

export default function ReportWrapper({ id }: IProps) {
	const router = useRouter();
	const { data } = useSWR<IResponseEnvelope<{ inspection: IInspection }>>(
		`/api/inspections/${id}`,
		fetcher,
		{ revalidateOnMount: true },
	);
	const ins = data?.data?.inspection;
	const locked = !!ins?.reportLockedAt;

	const [tab, setTab] = useState<"Vehicle Details" | SectionKey | "Verdict">(
		"Vehicle Details",
	);
	const [overview, setOverview] = useState<IOverview>({});
	const [sections, setSections] =
		useState<Record<string, IChecklistItem[]>>(buildInitialReport);
	const [verdict, setVerdict] = useState<"good" | "caution" | "danger">(
		"good",
	);
	const [summary, setSummary] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	// Prefill the vehicle details from the booking (year/make/model) the first
	// time the inspection loads, without clobbering anything the inspector has
	// already typed.
	useEffect(() => {
		if (!ins?.car) return;
		setOverview((prev) => ({
			year: prev.year ?? ins.car.year,
			make: prev.make ?? ins.car.make,
			model: prev.model ?? ins.car.model,
			...prev,
		}));
	}, [ins?.car]);

	function setOverviewField(key: keyof IOverview, value: string) {
		setOverview((prev) => ({
			...prev,
			[key]:
				key === "year"
					? value
						? Number(value.replace(/[^0-9]/g, "")) || undefined
						: undefined
					: value,
		}));
	}

	function setItemStatus(
		sectionLabel: string,
		label: string,
		status: Status,
	) {
		setSections((prev) => {
			const next = { ...prev };
			next[sectionLabel] = next[sectionLabel].map((i) =>
				i.label === label ? { ...i, status } : i,
			);
			return next;
		});
	}

	function setItemComment(
		sectionLabel: string,
		label: string,
		comment: string,
	) {
		setSections((prev) => {
			const next = { ...prev };
			next[sectionLabel] = next[sectionLabel].map((i) =>
				i.label === label ? { ...i, comment } : i,
			);
			return next;
		});
	}

	async function submit() {
		if (busy || locked) return;

		// Every minor/serious item must carry a comment — enforce it client-side
		// and jump the inspector to the first offending section.
		const allItems = Object.entries(sections);
		for (const [sectionLabel, items] of allItems) {
			const offending = items.find(
				(i) =>
					(i.status === "minor" || i.status === "serious") &&
					!i.comment?.trim(),
			);
			if (offending) {
				setTab(sectionLabel as SectionKey);
				setError(
					`Add a comment for "${offending.label}" — every minor or serious item needs one.`,
				);
				return;
			}
		}
		if (!summary.trim()) {
			setTab("Verdict");
			setError("Write a short summary for the buyer before submitting.");
			return;
		}

		// Derive the at-a-glance counts the buyer's Overview tab reads.
		const flat = allItems.flatMap(([, items]) => items);
		const counts = flat.reduce(
			(acc, i) => {
				if (i.status === "good") acc.passed++;
				else if (i.status === "minor") acc.minor++;
				else if (i.status === "serious") acc.serious++;
				return acc;
			},
			{ passed: 0, minor: 0, serious: 0 },
		);
		const fixes = flat
			.filter((i) => i.status === "minor" || i.status === "serious")
			.map((i) => ({
				label: i.label,
				priority: (i.status === "serious" ? "High" : "Medium") as
					| "Low"
					| "Medium"
					| "High",
			}));

		setBusy(true);
		setError(null);
		try {
			const report = {
				overview: {
					...overview,
					// Always anchor to the booked vehicle if the inspector left
					// the prefilled fields untouched.
					make: overview.make ?? ins?.car?.make,
					model: overview.model ?? ins?.car?.model,
					year: overview.year ?? ins?.car?.year,
				},
				exterior: sections.Exterior,
				interior: sections.Interior,
				mechanical: sections.Mechanical,
				roadTest: sections["Road Test"],
				verdict,
				summary: {
					passed: counts.passed,
					minor: counts.minor,
					serious: counts.serious,
					written: summary,
					fixes,
				},
			};
			await api().patch(`/api/inspections/${id}/report`, {
				report,
				lock: true,
			});
			router.push(`/inspections/${id}`);
			router.refresh();
		} catch (err) {
			setError(getErrorMessage(err, "Could not submit report"));
			setBusy(false);
		}
	}

	const verdictPills: Array<{
		k: "good" | "caution" | "danger";
		label: string;
	}> = [
		{ k: "good", label: "Worth Buying" },
		{ k: "caution", label: "Buy With Caution" },
		{ k: "danger", label: "Not Recommended" },
	];

	return (
		<PageShell
			eyebrow={`Report · ${id}`}
			title="Submit"
			titleEm="report"
			navTitle="Report"
			subtitle="Every minor or serious item must include a comment. Once submitted, the report is locked."
		>
			<TabsStyled data-testid="report-tabs">
				{[
					"Vehicle Details" as const,
					...(Object.keys(DEFAULT_SECTIONS) as SectionKey[]),
					"Verdict" as const,
				].map((t) => (
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

			{tab === "Vehicle Details" && (
				<SectionStyled data-testid="report-section-vehicle">
					<Eyebrow $gold className="eyebrow-spaced">
						Vehicle Details
					</Eyebrow>
					<VehicleGridStyled>
						<VehicleFieldStyled>
							<span className="vf-label">Year</span>
							<input
								inputMode="numeric"
								value={overview.year ?? ""}
								onChange={(e) =>
									setOverviewField("year", e.target.value)
								}
								placeholder="e.g. 2019"
							/>
						</VehicleFieldStyled>
						{VEHICLE_TEXT_FIELDS.map(([key, label]) => (
							<VehicleFieldStyled key={key}>
								<span className="vf-label">{label}</span>
								<input
									value={(overview[key] as string) ?? ""}
									onChange={(e) =>
										setOverviewField(key, e.target.value)
									}
									placeholder={label}
								/>
							</VehicleFieldStyled>
						))}
					</VehicleGridStyled>
				</SectionStyled>
			)}

			{tab !== "Verdict" && tab !== "Vehicle Details" && (
				<SectionStyled data-testid={`report-section-${tab}`}>
					<Eyebrow $gold className="eyebrow-spaced">
						{tab}
					</Eyebrow>
					{sections[tab as SectionKey].map((item) => {
						const needsComment =
							item.status === "minor" ||
							item.status === "serious";
						return (
							<ItemWrapStyled key={item.label}>
								<ItemRowStyled className="bare">
									<span className="item-label">
										{item.label}
									</span>
									<StatusBtnsStyled>
										{STATUSES.map((s) => (
											<StatusBtnStyled
												key={s}
												$on={item.status === s}
												$status={s}
												onClick={() =>
													setItemStatus(
														tab,
														item.label,
														s,
													)
												}
												type="button"
											>
												{s}
											</StatusBtnStyled>
										))}
									</StatusBtnsStyled>
								</ItemRowStyled>
								{needsComment && (
									<CommentInputStyled
										rows={2}
										value={item.comment ?? ""}
										onChange={(e) =>
											setItemComment(
												tab,
												item.label,
												e.target.value,
											)
										}
										placeholder={`Describe the ${item.status} issue with ${item.label.toLowerCase()}…`}
									/>
								)}
							</ItemWrapStyled>
						);
					})}
					{error && <ErrorBoxStyled>{error}</ErrorBoxStyled>}
				</SectionStyled>
			)}

			{tab === "Verdict" && (
				<SectionStyled>
					<Eyebrow $gold className="eyebrow-spaced">
						Final verdict
					</Eyebrow>
					<div className="verdict-pills">
						{verdictPills.map((v) => (
							<Pill
								key={v.k}
								tone={
									v.k === "good"
										? "good"
										: v.k === "caution"
											? "caution"
											: "danger"
								}
							>
								<VerdictButtonStyled
									type="button"
									onClick={() => setVerdict(v.k)}
								>
									{v.k === verdict ? "✓ " : ""}
									{v.label}
								</VerdictButtonStyled>
							</Pill>
						))}
					</div>
					<label className="summary-label" htmlFor="report-summary">
						<span className="summary-label-text">
							Summary for the buyer
						</span>
						<SummaryInputStyled
							id="report-summary"
							rows={5}
							value={summary}
							onChange={(e) => setSummary(e.target.value)}
							placeholder="Two to three sentences summarising your findings…"
						/>
					</label>
					{error && <ErrorBoxStyled>{error}</ErrorBoxStyled>}
					<div className="submit-row">
						<Button
							variant="primary"
							size="md"
							iconRight="check"
							onClick={submit}
							disabled={busy || locked}
						>
							{locked
								? "Report locked"
								: busy
									? "Submitting…"
									: "Submit & lock report"}
						</Button>
					</div>
				</SectionStyled>
			)}
		</PageShell>
	);
}
