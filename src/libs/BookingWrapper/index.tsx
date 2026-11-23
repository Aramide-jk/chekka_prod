"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Button, Icon, Pill, Select, Stars } from "@/components";
import { api, fetcher, getErrorMessage } from "@/constants";
import { AppContextProvider } from "@/hooks";
import { PageShell } from "@/layouts";
import type { IResponseEnvelope } from "@/types";
import {
	BrowseRowStyled,
	ConfirmListStyled,
	ErrorBoxStyled,
	FormGridStyled,
	GridStyled,
	InspectorListStyled,
	InspectorRowStyled,
	LabelStyled,
	LineStyled,
	MugStyled,
	PanelLedeStyled,
	PanelStyled,
	PanelTitleStyled,
	SlotGridStyled,
	SlotStyled,
	StepActionsStyled,
	StepNumStyled,
	StepPillStyled,
	StepperStyled,
	SummaryStyled,
	TotalStyled,
	TypeCardStyled,
	TypeDescStyled,
	TypeGridStyled,
	TypeNameStyled,
	TypePriceStyled,
	UrgentCardStyled,
} from "./styled";

const STEPS = [
	{ k: "1", label: "Car details" },
	{ k: "2", label: "Inspection type" },
	{ k: "3", label: "Inspector" },
	{ k: "4", label: "Schedule" },
	{ k: "5", label: "Payment" },
] as const;

const NEXT_STEP: Record<string, string> = {
	"1": "2",
	"2": "3",
	"3": "4",
	"4": "5",
};

const PRICE_BY_TYPE = { standard: 32_000, premium: 52_000, special_request: 0 };
const PLATFORM_FEE = 2_500;
// Keep in sync with URGENT_SURCHARGE in createInspection.ts.
const URGENT_SURCHARGE = 10_000;

type InspectionType = "standard" | "premium" | "special_request";
type SellerType = "dealership" | "private";

interface IPublicSiteConfig {
	pricing: {
		standardInspectionPrice: number;
		premiumInspectionPrice: number;
		platformFee: number;
	};
}

interface IDraft {
	car: {
		make: string;
		model: string;
		year: number;
		color?: string;
		sellerType: SellerType;
		city: string;
		address: string;
		sellerContact?: string;
		notes?: string;
	};
	buyerContact: {
		name: string;
		phone: string;
	};
	inspectionType: InspectionType;
	urgent: boolean;
	assignedInspectorId?: string;
	scheduledFor?: string;
	slot?: string;
}

const DRAFT_KEY = "chekka:booking:draft:v1";

function defaultDraft(): IDraft {
	return {
		car: {
			make: "Toyota",
			model: "Camry",
			year: 2020,
			sellerType: "dealership",
			city: "Lagos",
			address: "",
			sellerContact: "",
		},
		buyerContact: { name: "", phone: "" },
		inspectionType: "premium",
		urgent: false,
	};
}

function readDraft(): IDraft {
	if (typeof window === "undefined") return defaultDraft();
	try {
		const raw = window.localStorage.getItem(DRAFT_KEY);
		if (!raw) return defaultDraft();
		return { ...defaultDraft(), ...JSON.parse(raw) };
	} catch {
		return defaultDraft();
	}
}

function writeDraft(d: IDraft) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
	} catch {
		// ignore
	}
}

interface IProps {
	step: string;
}

interface IInspectorListItem {
	_id: string;
	userId?: string;
	user?: { fullName?: string; city?: string };
	rating: number;
	totalCompleted: number;
}

const SLOTS = ["09:00", "11:00", "14:00", "16:00"];
const CITIES = ["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan"];

// Compose a UTC ISO datetime from a calendar date + a fixed slot. The slot the
// buyer picks must be reflected in `scheduledFor` (not hardcoded to 09:00).
function isoForDateSlot(date: string, slot?: string): string {
	return new Date(`${date}T${slot ?? "09:00"}:00Z`).toISOString();
}

const TYPES: Array<{
	k: InspectionType;
	name: string;
	price: string;
	desc: string;
}> = [
	{
		k: "standard",
		name: "Standard",
		price: "₦32,000",
		desc: "50+ checkpoints. 30+ photos. 48-hour turnaround.",
	},
	{
		k: "premium",
		name: "Premium",
		price: "₦52,000",
		desc: "Top-tier inspectors. OBD2 scan. 24-hour turnaround.",
	},
	{
		k: "special_request",
		name: "Special",
		price: "Custom",
		desc: "Salvage, classics, fleet. Consultant-led intake.",
	},
];

export default function BookingWrapper({ step }: IProps) {
	const router = useRouter();
	const { user } = useContext(AppContextProvider);
	const stepIndex = useMemo(
		() => STEPS.findIndex((s) => s.k === step),
		[step],
	);
	const next = NEXT_STEP[step];
	const [draft, setDraft] = useState<IDraft>(() => defaultDraft());
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	// When no inspector covers the buyer's city, they can opt to browse
	// inspectors nationwide (Step 3).
	const [allStates, setAllStates] = useState(false);

	useEffect(() => {
		setDraft(readDraft());
	}, []);

	// Deep-link support: the buyer dashboard, inspector directory, and landing
	// page pricing can start a booking pre-seeded with an inspector (?inspector=),
	// the urgent flag (?urgent=1), and/or an inspection tier (?type=standard|premium|special_request).
	// Parsed from the URL directly (like LoginWrapper) to avoid pulling the whole
	// /book route into client-only rendering via useSearchParams.
	useEffect(() => {
		if (typeof window === "undefined") return;
		const sp = new URLSearchParams(window.location.search);
		const inspectorParam = sp.get("inspector");
		const urgentParam = sp.get("urgent");
		const typeParam = sp.get("type");
		const validTypes: InspectionType[] = [
			"standard",
			"premium",
			"special_request",
		];
		const matchedType = validTypes.includes(typeParam as InspectionType)
			? (typeParam as InspectionType)
			: undefined;

		if (!inspectorParam && urgentParam !== "1" && !matchedType) return;
		setDraft((prev) => {
			const merged = {
				...prev,
				...(inspectorParam
					? { assignedInspectorId: inspectorParam }
					: {}),
				...(urgentParam === "1" ? { urgent: true } : {}),
				...(matchedType ? { inspectionType: matchedType } : {}),
			};
			writeDraft(merged);
			return merged;
		});
	}, []);

	// Pre-fill the buyer's own contact details from their session the first
	// time the form loads (only if they haven't typed anything yet).
	useEffect(() => {
		if (!user) return;
		setDraft((prev) => {
			if (prev.buyerContact.name || prev.buyerContact.phone) return prev;
			const merged = {
				...prev,
				buyerContact: {
					name: user.fullName ?? "",
					phone: user.phone ?? "",
				},
			};
			writeDraft(merged);
			return merged;
		});
	}, [user]);

	function patch(d: Partial<IDraft>) {
		setDraft((prev) => {
			const merged = { ...prev, ...d };
			writeDraft(merged);
			return merged;
		});
	}
	function patchCar(d: Partial<IDraft["car"]>) {
		setDraft((prev) => {
			const merged = { ...prev, car: { ...prev.car, ...d } };
			writeDraft(merged);
			return merged;
		});
	}
	function patchBuyer(d: Partial<IDraft["buyerContact"]>) {
		setDraft((prev) => {
			const merged = {
				...prev,
				buyerContact: { ...prev.buyerContact, ...d },
			};
			writeDraft(merged);
			return merged;
		});
	}

	const { data: inspectorsData } = useSWR<
		IResponseEnvelope<{ inspectors: IInspectorListItem[] }>
	>(
		step === "3"
			? allStates
				? `/api/inspectors`
				: `/api/inspectors?city=${encodeURIComponent(draft.car.city)}`
			: null,
		fetcher,
		{ revalidateOnMount: true },
	);
	const inspectors = inspectorsData?.data?.inspectors ?? [];

	const selectedDate = draft.scheduledFor
		? draft.scheduledFor.slice(0, 10)
		: "";
	const { data: availData } = useSWR<
		IResponseEnvelope<{
			taken: string[];
			available: string[];
			dayAvailable: boolean;
			isPast: boolean;
			reason: string | null;
		}>
	>(
		step === "4" && draft.assignedInspectorId && selectedDate
			? `/api/inspectors/${draft.assignedInspectorId}/availability?date=${selectedDate}`
			: null,
		fetcher,
		{ revalidateOnMount: true },
	);
	const takenSlots = availData?.data?.taken ?? [];
	const dayAvailable = availData?.data?.dayAvailable ?? true;
	const dayReason = availData?.data?.reason ?? null;

	const { data: configRes } = useSWR<IResponseEnvelope<IPublicSiteConfig>>(
		"/api/site-config",
		fetcher,
	);
	const standardPrice =
		configRes?.data?.pricing?.standardInspectionPrice ?? 32_000;
	const premiumPrice =
		configRes?.data?.pricing?.premiumInspectionPrice ?? 52_000;
	const activePlatformFee =
		configRes?.data?.pricing?.platformFee ?? PLATFORM_FEE;

	const dynamicPriceByType: Record<InspectionType, number> = useMemo(
		() => ({
			standard: standardPrice,
			premium: premiumPrice,
			special_request: 0,
		}),
		[standardPrice, premiumPrice],
	);

	const inspectionTypes = useMemo(
		() => [
			{
				k: "standard" as const,
				name: "Standard",
				price: `₦${standardPrice.toLocaleString()}`,
				desc: "50+ checkpoints. 30+ photos. 48-hour turnaround.",
			},
			{
				k: "premium" as const,
				name: "Premium",
				price: `₦${premiumPrice.toLocaleString()}`,
				desc: "Top-tier inspectors. OBD2 scan. 24-hour turnaround.",
			},
			{
				k: "special_request" as const,
				name: "Special",
				price: "Custom",
				desc: "Salvage, classics, fleet. Consultant-led intake.",
			},
		],
		[standardPrice, premiumPrice],
	);

	const price =
		dynamicPriceByType[draft.inspectionType] +
		(draft.urgent ? URGENT_SURCHARGE : 0);
	const total = price + activePlatformFee;
	const todayStr = new Date().toISOString().slice(0, 10);

	function missingRequiredFields(): string[] {
		const m: string[] = [];
		if (!draft.car.make.trim()) m.push("Make");
		if (!draft.car.model.trim()) m.push("Model");
		if (!draft.car.year || draft.car.year < 1980) m.push("Year");
		if (!draft.car.city.trim()) m.push("City");
		if (!draft.car.address.trim()) m.push("Address / landmark");
		return m;
	}

	function goNext() {
		if (!next) return;
		if (step === "1") {
			const missing = missingRequiredFields();
			if (missing.length) {
				setError(`Please fill in: ${missing.join(", ")}.`);
				return;
			}
			if (!draft.buyerContact.phone.trim()) {
				setError(
					"Please add a contact phone number so we can reach you.",
				);
				return;
			}
		}
		// Step 3 — an inspector must be chosen before continuing. Special
		// requests are consultant-led and skip inspector selection.
		if (
			step === "3" &&
			draft.inspectionType !== "special_request" &&
			!draft.assignedInspectorId
		) {
			setError("Please select an inspector to continue.");
			return;
		}
		// Step 4 — a bookable date and time slot are both required.
		if (step === "4" && draft.inspectionType !== "special_request") {
			if (!selectedDate) {
				setError("Please pick a date.");
				return;
			}
			if (!dayAvailable) {
				setError(
					"That date isn't available — choose another day the inspector is working.",
				);
				return;
			}
			if (!draft.slot) {
				setError("Please pick a time slot.");
				return;
			}
		}
		setError(null);
		router.push(`/book/${next}`);
	}

	async function submitBooking() {
		if (busy) return;
		setError(null);

		const missing = missingRequiredFields();
		if (missing.length) {
			setError(
				`Missing required car details: ${missing.join(", ")}. Go back to step 1 to fix.`,
			);
			return;
		}
		if (draft.inspectionType !== "special_request") {
			if (!draft.assignedInspectorId) {
				setError("Select an inspector (Step 3) before confirming.");
				return;
			}
			if (!draft.scheduledFor || !draft.slot) {
				setError("Pick a date and time (Step 4) before confirming.");
				return;
			}
		}

		setBusy(true);
		try {
			const createRes = await api().post("/api/inspections", {
				inspectionType: draft.inspectionType,
				car: draft.car,
				buyerContact: {
					name: draft.buyerContact.name || undefined,
					phone: draft.buyerContact.phone || undefined,
				},
				urgent: draft.urgent,
				assignedInspectorId: draft.assignedInspectorId,
				scheduledFor: draft.scheduledFor,
				slot: draft.slot,
			});
			const inspection = createRes.data?.data?.inspection;
			if (!inspection?._id) throw new Error("Booking failed");
			const paymentRes = await api().post(
				"/api/transactions/initialize",
				{
					inspectionId: inspection._id,
				},
			);
			const authorizationUrl = paymentRes.data?.data?.authorizationUrl;
			if (!authorizationUrl)
				throw new Error("Payment initialization failed");
			if (typeof window !== "undefined") {
				try {
					window.localStorage.removeItem(DRAFT_KEY);
				} catch {
					// ignore
				}
			}
			window.location.assign(authorizationUrl);
			return;
			// could re-submit — with the draft cleared and this entry replaced,
			// it can't. `busy` is intentionally left `true` so the confirm button
			// stays disabled for the brief moment before navigation.
		} catch (err) {
			const message = getErrorMessage(err, "Could not complete booking");
			if (
				message.startsWith("Selected inspector is no longer available")
			) {
				patch({
					assignedInspectorId: undefined,
					scheduledFor: undefined,
					slot: undefined,
				});
				setError(message);
				setBusy(false);
				router.push("/book/3");
				return;
			}
			if (
				message.startsWith(
					"This inspector is no longer available for the selected time slot",
				)
			) {
				patch({ scheduledFor: undefined, slot: undefined });
				setError(message);
				setBusy(false);
				router.push("/book/4");
				return;
			}
			setError(message);
			setBusy(false);
		}
	}

	return (
		<PageShell
			eyebrow="Booking"
			title="Book an"
			titleEm="inspection"
			navTitle={`Book · Step ${step} of 5`}
			subtitle="Five steps. Nothing is charged until you confirm."
		>
			<StepperStyled data-testid="booking-stepper">
				{STEPS.map((s, idx) => (
					<StepPillStyled
						key={s.k}
						$on={idx === stepIndex}
						$done={idx < stepIndex}
					>
						<StepNumStyled
							$on={idx === stepIndex}
							$done={idx < stepIndex}
						>
							{s.k}
						</StepNumStyled>
						{s.label}
					</StepPillStyled>
				))}
			</StepperStyled>

			<GridStyled>
				<PanelStyled data-testid={`booking-step-${step}`}>
					{step === "1" && (
						<>
							<PanelTitleStyled>
								Tell us about the car
							</PanelTitleStyled>
							<PanelLedeStyled>
								Where it is and what it is — we'll match you
								with the right inspector.
							</PanelLedeStyled>
							<FormGridStyled>
								<LabelStyled>
									Seller type
									<Select
										ariaLabel="Seller type"
										value={draft.car.sellerType}
										onChange={(v) =>
											patchCar({
												sellerType: v as SellerType,
											})
										}
										options={[
											{
												value: "dealership",
												label: "Dealership",
											},
											{
												value: "private",
												label: "Private owner",
											},
										]}
									/>
								</LabelStyled>
								<LabelStyled>
									Year
									<input
										type="number"
										value={draft.car.year}
										onChange={(e) =>
											patchCar({
												year:
													Number(e.target.value) || 0,
											})
										}
									/>
								</LabelStyled>
								<LabelStyled>
									Make
									<input
										value={draft.car.make}
										onChange={(e) =>
											patchCar({ make: e.target.value })
										}
									/>
								</LabelStyled>
								<LabelStyled>
									Model
									<input
										value={draft.car.model}
										onChange={(e) =>
											patchCar({ model: e.target.value })
										}
									/>
								</LabelStyled>
								<LabelStyled>
									City
									<Select
										ariaLabel="City"
										value={draft.car.city}
										onChange={(v) => patchCar({ city: v })}
										options={CITIES.map((c) => ({
											value: c,
											label: c,
										}))}
									/>
								</LabelStyled>
								<LabelStyled>
									Address / landmark
									<span className="required">*</span>
									<input
										required
										value={draft.car.address}
										onChange={(e) =>
											patchCar({
												address: e.target.value,
											})
										}
										placeholder="Lekki Phase 1, near…"
									/>
								</LabelStyled>
								<LabelStyled className="full-span">
									Seller's phone (so the inspector can reach
									them)
									<input
										value={draft.car.sellerContact ?? ""}
										onChange={(e) =>
											patchCar({
												sellerContact: e.target.value,
											})
										}
										placeholder="+2348012345678"
									/>
								</LabelStyled>
							</FormGridStyled>

							<PanelTitleStyled className="contact-title">
								Your contact details
							</PanelTitleStyled>
							<PanelLedeStyled className="contact-lede">
								We'll use these to keep you updated and
								coordinate the inspection.
							</PanelLedeStyled>
							<FormGridStyled>
								<LabelStyled>
									Your name
									<input
										value={draft.buyerContact.name}
										onChange={(e) =>
											patchBuyer({ name: e.target.value })
										}
										placeholder="Ada Lovelace"
									/>
								</LabelStyled>
								<LabelStyled>
									Your phone
									<span className="required">*</span>
									<input
										value={draft.buyerContact.phone}
										onChange={(e) =>
											patchBuyer({
												phone: e.target.value,
											})
										}
										placeholder="+2348012345678"
									/>
								</LabelStyled>
							</FormGridStyled>
							{error && (
								<ErrorBoxStyled role="alert">
									{error}
								</ErrorBoxStyled>
							)}
						</>
					)}

					{step === "2" && (
						<>
							<PanelTitleStyled>
								Pick an inspection type
							</PanelTitleStyled>
							<PanelLedeStyled>
								Three tiers. Each one ends with a verdict you
								can act on.
							</PanelLedeStyled>
							<TypeGridStyled>
								{inspectionTypes.map((t) => (
									<TypeCardStyled
										key={t.k}
										$selected={draft.inspectionType === t.k}
										type="button"
										onClick={() =>
											patch({ inspectionType: t.k })
										}
									>
										<TypeNameStyled>
											{t.name}
										</TypeNameStyled>
										<TypePriceStyled>
											{t.price}
										</TypePriceStyled>
										<TypeDescStyled>
											{t.desc}
										</TypeDescStyled>
									</TypeCardStyled>
								))}
							</TypeGridStyled>

							<UrgentCardStyled
								$on={draft.urgent}
								type="button"
								onClick={() => patch({ urgent: !draft.urgent })}
								aria-pressed={draft.urgent}
							>
								<div className="urgent-info">
									<Icon name="clock" size={20} />
									<div>
										<div className="urgent-title">
											Urgent inspection
										</div>
										<div className="urgent-sub">
											Same-day priority. We push your job
											to the front of the inspector queue.
											+₦
											{URGENT_SURCHARGE.toLocaleString()}.
										</div>
									</div>
								</div>
								<Pill
									tone={draft.urgent ? "gold" : "ghost"}
									dot
								>
									{draft.urgent ? "On" : "Off"}
								</Pill>
							</UrgentCardStyled>
						</>
					)}

					{step === "3" && (
						<>
							<PanelTitleStyled>
								Choose your inspector
							</PanelTitleStyled>
							<PanelLedeStyled>
								{allStates
									? "Showing certified inspectors nationwide. They may travel to your city."
									: `Top-rated certified inspectors in ${draft.car.city}. Tap to select.`}
							</PanelLedeStyled>
							<InspectorListStyled>
								{inspectors.length === 0 && (
									<div className="empty">
										<span>
											{allStates
												? "No inspectors are available right now. Please try again shortly."
												: `No inspectors are currently available in ${draft.car.city}.`}
										</span>
										{!allStates && (
											<Button
												variant="secondary"
												size="sm"
												icon="map-pin"
												onClick={() =>
													setAllStates(true)
												}
											>
												Show inspectors from other
												states
											</Button>
										)}
									</div>
								)}
								{inspectors.map((p) => {
									const selected =
										draft.assignedInspectorId ===
										(p.userId ?? p._id);
									const userIdForSelect = String(
										p.userId ?? p._id,
									);
									return (
										<InspectorRowStyled
											key={userIdForSelect}
											$selected={selected}
										>
											<MugStyled>
												{(p.user?.fullName ?? "??")
													.split(" ")
													.map((w) => w[0])
													.join("")
													.slice(0, 2)}
											</MugStyled>
											<div className="info">
												<div className="name">
													{p.user?.fullName ??
														"Inspector"}
												</div>
												<div className="meta">
													<span>
														{p.user?.city ?? "—"}
													</span>
													<span>
														{p.totalCompleted} jobs
													</span>
												</div>
											</div>
											<Stars rating={p.rating} />
											<Button
												variant={
													selected
														? "primary"
														: "secondary"
												}
												size="sm"
												onClick={() =>
													patch({
														assignedInspectorId:
															userIdForSelect,
													})
												}
											>
												{selected
													? "Selected"
													: "Select"}
											</Button>
										</InspectorRowStyled>
									);
								})}
							</InspectorListStyled>
							{inspectors.length > 0 && (
								<BrowseRowStyled>
									<Button
										variant="ghost"
										size="sm"
										icon="map-pin"
										onClick={() => setAllStates((v) => !v)}
									>
										{allStates
											? `Back to inspectors in ${draft.car.city}`
											: "Browse inspectors from other states"}
									</Button>
								</BrowseRowStyled>
							)}
							{error && (
								<ErrorBoxStyled role="alert">
									{error}
								</ErrorBoxStyled>
							)}
						</>
					)}

					{step === "4" && (
						<>
							<PanelTitleStyled>
								Pick a date & slot
							</PanelTitleStyled>
							<PanelLedeStyled>
								Slots are fixed: 09:00, 11:00, 14:00, 16:00.
								Greyed-out times are unavailable.
							</PanelLedeStyled>
							<LabelStyled className="date-label">
								Date
								<input
									type="date"
									min={todayStr}
									value={
										draft.scheduledFor
											? draft.scheduledFor.slice(0, 10)
											: ""
									}
									onChange={(e) => {
										const v = e.target.value;
										// Reject past dates outright.
										if (v && v < todayStr) {
											setError(
												"You can't book a date in the past.",
											);
											return;
										}
										setError(null);
										patch({
											// Changing the date clears any slot
											// that may no longer be available.
											slot: undefined,
											scheduledFor: v
												? isoForDateSlot(v, undefined)
												: undefined,
										});
									}}
								/>
							</LabelStyled>
							{selectedDate && !dayAvailable && (
								<ErrorBoxStyled role="alert">
									{dayReason === "past"
										? "That date has already passed — pick an upcoming day."
										: dayReason === "blocked"
											? "The inspector marked this day as unavailable. Please choose another."
											: "The inspector isn't working that day. Please choose another."}
								</ErrorBoxStyled>
							)}
							<SlotGridStyled>
								{SLOTS.map((s) => {
									const taken = takenSlots.includes(s);
									return (
										<SlotStyled
											key={s}
											$on={draft.slot === s}
											$taken={taken}
											type="button"
											disabled={taken}
											title={
												taken
													? "Already booked"
													: undefined
											}
											onClick={() => {
												if (taken) return;
												patch({
													slot: s,
													scheduledFor: selectedDate
														? isoForDateSlot(
																selectedDate,
																s,
															)
														: draft.scheduledFor,
												});
											}}
										>
											{s}
										</SlotStyled>
									);
								})}
							</SlotGridStyled>
							{error && (
								<ErrorBoxStyled role="alert">
									{error}
								</ErrorBoxStyled>
							)}
						</>
					)}

					{step === "5" && (
						<>
							<PanelTitleStyled>Confirm and pay</PanelTitleStyled>
							<PanelLedeStyled>
								Payment is held securely. The inspector is only
								locked to the job after Paystack confirms.
							</PanelLedeStyled>
							<ConfirmListStyled>
								<div>
									<Icon name="car" size={14} />{" "}
									{draft.car.make} {draft.car.model}{" "}
									{draft.car.year} —{" "}
									{draft.car.address || draft.car.city}
								</div>
								<div>
									<Icon name="shield-check" size={14} />{" "}
									{draft.inspectionType} inspection
								</div>
								<div>
									<Icon name="calendar" size={14} />{" "}
									{draft.scheduledFor
										? `${new Date(draft.scheduledFor).toLocaleDateString()} · ${draft.slot ?? "—"}`
										: "Date pending"}
								</div>
							</ConfirmListStyled>
							{error && (
								<ErrorBoxStyled role="alert">
									{error}
								</ErrorBoxStyled>
							)}
						</>
					)}

					<StepActionsStyled>
						{stepIndex > 0 ? (
							<Link href={`/book/${stepIndex}`}>
								<Button
									variant="ghost"
									size="md"
									icon="chevron-left"
								>
									Back
								</Button>
							</Link>
						) : (
							<span></span>
						)}
						{step === "5" ? (
							<Button
								variant="primary"
								size="md"
								iconRight="chevron-right"
								disabled={busy}
								onClick={submitBooking}
							>
								{busy
									? "Processing…"
									: `Pay (mock) · ₦${total.toLocaleString()}`}
							</Button>
						) : (
							<Button
								variant="primary"
								size="md"
								iconRight="chevron-right"
								onClick={goNext}
							>
								Continue
							</Button>
						)}
					</StepActionsStyled>
				</PanelStyled>

				<SummaryStyled>
					<div className="summary-label">Summary</div>
					<LineStyled>
						<span>Inspection</span>
						<span>{draft.inspectionType}</span>
					</LineStyled>
					<LineStyled>
						<span>Fee</span>
						<span>
							₦
							{dynamicPriceByType[
								draft.inspectionType
							].toLocaleString()}
						</span>
					</LineStyled>
					{draft.urgent && (
						<LineStyled>
							<span>Urgent priority</span>
							<span>₦{URGENT_SURCHARGE.toLocaleString()}</span>
						</LineStyled>
					)}
					<LineStyled>
						<span>Platform service</span>
						<span>₦{activePlatformFee.toLocaleString()}</span>
					</LineStyled>
					<TotalStyled>
						<span>Total</span>
						<span>₦{total.toLocaleString()}</span>
					</TotalStyled>
					<div className="escrow">
						<Pill tone="ghost" dot>
							Escrow protected
						</Pill>
					</div>
				</SummaryStyled>
			</GridStyled>
		</PageShell>
	);
}
