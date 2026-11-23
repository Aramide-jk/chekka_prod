"use client";

import Link from "next/link";
import { useContext, useState } from "react";
import { Button, Icon, Select } from "@/components";
import { api, getErrorMessage } from "@/constants";
import { AppContextProvider } from "@/hooks";
import { PageShell } from "@/layouts";
import {
	ActionsStyled,
	DocsStyled,
	DropStyled,
	ErrorBoxStyled,
	FormGridStyled,
	IntroListStyled,
	LabelStyled,
	LedeStyled,
	PanelStyled,
	PanelTitleStyled,
	PhotoPreviewStyled,
	PhotoRowStyled,
	SpecChipStyled,
	SpecChipsStyled,
	StepCountStyled,
	StepPillStyled,
	StepperStyled,
	SuccessPanelStyled,
} from "./styled";

const STEPS = ["Personal", "Professional", "Documents"] as const;

// Shown on the first step so applicants know what the three steps lead to and
// what happens after they submit.
const PROCESS_STEPS = [
	"Tell us who you are and add a profile photo buyers will see.",
	"Share your experience and the vehicle types you specialise in.",
	"Upload your ID for verification (and a certificate to get Certified).",
	"We review within 48 hours — then you can start accepting jobs.",
] as const;

// Inspectors pick from a fixed set of vehicle categories (multiple allowed),
// rather than typing free text.
const SPECIALISATION_OPTIONS = [
	"Saloon",
	"Sedan",
	"SUV",
	"Hatchback",
	"Pickup",
	"Truck",
	"Bus / Van",
	"Luxury",
	"Hybrid / EV",
	"Commercial",
] as const;

export default function ApplyWrapper() {
	const { setUser } = useContext(AppContextProvider);
	const [step, setStep] = useState(0);
	const [city, setCity] = useState("Lagos");
	const [years, setYears] = useState(0);
	const [specialisations, setSpecialisations] = useState<string[]>([]);
	const [bio, setBio] = useState("");

	function toggleSpecialisation(s: string) {
		setSpecialisations((prev) =>
			prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
		);
	}
	const [photo, setPhoto] = useState<File | null>(null);
	const [photoPreview, setPhotoPreview] = useState<string | null>(null);
	const [idDoc, setIdDoc] = useState<File | null>(null);
	const [cert, setCert] = useState<File | null>(null);
	const [extra, setExtra] = useState<File | null>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [submitted, setSubmitted] = useState(false);

	const isLast = step === STEPS.length - 1;

	function onPickPhoto(file: File | null) {
		if (!file) return;
		setPhoto(file);
		setPhotoPreview((prev) => {
			if (prev) URL.revokeObjectURL(prev);
			return URL.createObjectURL(file);
		});
	}

	async function submit() {
		if (busy) return;
		// A profile photo is required for inspectors — buyers see it on the
		// report and when booking, so it's part of trust, not optional.
		if (!photo) {
			setError("Please add a profile photo so buyers can recognise you.");
			setStep(0);
			return;
		}
		// A government ID / driver's licence is mandatory for identity
		// verification. The professional certificate is optional.
		if (!idDoc) {
			setError(
				"Please upload your National ID or Driver's License to continue.",
			);
			return;
		}
		setBusy(true);
		setError(null);
		try {
			// Save the profile photo first; it's stored on the user account so it
			// shows up immediately in the header and on the report header.
			const avatarFd = new FormData();
			avatarFd.set("avatar", photo);
			const avatarRes = await api().post(
				"/api/users/me/avatar",
				avatarFd,
			);
			const updatedUser = avatarRes.data?.data?.user;
			if (updatedUser) setUser(updatedUser);

			const fd = new FormData();
			fd.set("yearsExperience", String(years));
			fd.set("specialisations", specialisations.join(", "));
			fd.set("bio", bio);
			fd.set("city", city);
			if (idDoc) fd.set("idDocument", idDoc);
			if (cert) fd.set("certificate", cert);
			if (extra) fd.set("extra", extra);
			// Don't set Content-Type — the browser must inject the multipart
			// boundary. Forcing `multipart/form-data` without it makes the
			// server's formData parse drop every file.
			await api().post("/api/inspector-profiles/apply", fd);
			setSubmitted(true);
		} catch (err) {
			setError(getErrorMessage(err, "Application failed"));
			setBusy(false);
		}
	}

	if (submitted) {
		return (
			<PageShell
				eyebrow="Inspector application"
				title="You're"
				titleEm="all set"
				navTitle="Apply"
				showAccount={false}
			>
				<SuccessPanelStyled>
					<span className="success-icon">
						<Icon name="check" size={28} />
					</span>
					<h2>Application submitted</h2>
					<p>
						Thanks for applying to the Chekka network. Our team
						reviews new inspectors within 48 hours — we'll notify you
						as soon as your account is verified.
					</p>
					<div className="success-actions">
						<Link href="/inspector/pending">
							<Button variant="primary" size="md" icon="clock">
								Track application status
							</Button>
						</Link>
						<Link href="/inspector/dashboard">
							<Button variant="secondary" size="md" icon="home">
								Go to dashboard
							</Button>
						</Link>
					</div>
				</SuccessPanelStyled>
			</PageShell>
		);
	}

	return (
		<PageShell
			eyebrow="Inspector application"
			title="Join the"
			titleEm="Chekka network"
			navTitle="Apply"
			subtitle="Three steps. Admin review usually completes within 48 hours."
			showAccount={false}
		>
			<StepperStyled data-testid="apply-stepper">
				{STEPS.map((s, idx) => (
					<StepPillStyled
						key={s}
						$on={idx === step}
						$done={idx < step}
					>
						{idx + 1}. {s}
					</StepPillStyled>
				))}
			</StepperStyled>

			<PanelStyled data-testid={`apply-step-${step}`}>
				<StepCountStyled>
					Step {step + 1} of {STEPS.length}
				</StepCountStyled>
				{step === 0 && (
					<>
						<PanelTitleStyled>Personal details</PanelTitleStyled>
						<LedeStyled>
							Here's how becoming a Chekka inspector works:
						</LedeStyled>
						<IntroListStyled>
							{PROCESS_STEPS.map((text, i) => (
								<li key={text}>
									<span className="intro-num">{i + 1}</span>
									{text}
								</li>
							))}
						</IntroListStyled>
						<PhotoRowStyled>
							<PhotoPreviewStyled>
								{photoPreview ? (
									// Local object URL preview of the chosen file.
									// biome-ignore lint/performance/noImgElement: local blob preview, not a remote asset
									<img src={photoPreview} alt="Profile" />
								) : (
									<Icon name="user" size={26} />
								)}
							</PhotoPreviewStyled>
							<div>
								<DropStyled>
									<Icon name="paperclip" size={16} />
									<div className="drop-label">
										Profile photo (required) —{" "}
										{photo?.name ?? "click to upload"}
									</div>
									<input
										type="file"
										accept="image/*"
										onChange={(e) =>
											onPickPhoto(
												e.target.files?.[0] ?? null,
											)
										}
									/>
								</DropStyled>
							</div>
						</PhotoRowStyled>
						<FormGridStyled>
							<LabelStyled className="span-all">
								City of operation
								<Select
									ariaLabel="City of operation"
									value={city}
									onChange={setCity}
									options={[
										"Lagos",
										"Abuja",
										"Port Harcourt",
										"Kano",
										"Ibadan",
									].map((c) => ({ value: c, label: c }))}
								/>
							</LabelStyled>
						</FormGridStyled>
					</>
				)}

				{step === 1 && (
					<>
						<PanelTitleStyled>
							Professional background
						</PanelTitleStyled>
						<LedeStyled>
							Tell us about your experience and what you
							specialise in.
						</LedeStyled>
						<FormGridStyled>
							<LabelStyled>
								Years of experience
								<input
									type="number"
									value={years}
									onChange={(e) =>
										setYears(Number(e.target.value) || 0)
									}
									min={0}
								/>
							</LabelStyled>
							<LabelStyled className="span-all" as="div">
								Specialisations (select all that apply)
								<SpecChipsStyled>
									{SPECIALISATION_OPTIONS.map((s) => (
										<SpecChipStyled
											key={s}
											type="button"
											$on={specialisations.includes(s)}
											onClick={() =>
												toggleSpecialisation(s)
											}
										>
											{s}
										</SpecChipStyled>
									))}
								</SpecChipsStyled>
							</LabelStyled>
							<LabelStyled className="span-all">
								Short bio
								<textarea
									rows={3}
									value={bio}
									onChange={(e) => setBio(e.target.value)}
									placeholder="A line or two about your background…"
								/>
							</LabelStyled>
						</FormGridStyled>
					</>
				)}

				{step === 2 && (
					<>
						<PanelTitleStyled>Documents</PanelTitleStyled>
						<LedeStyled>
							A National ID or Driver's License is required to
							verify your identity. A professional certificate is
							optional — approving it upgrades you to a Certified
							Inspector. Stored securely.
						</LedeStyled>
						<DocsStyled>
							<DropStyled>
								<Icon name="paperclip" size={18} />
								<div className="drop-label">
									National ID / Driver's License (required) —{" "}
									{idDoc?.name ??
										"drop a file or click to upload"}
								</div>
								<input
									type="file"
									accept="image/*,application/pdf"
									onChange={(e) =>
										setIdDoc(e.target.files?.[0] ?? null)
									}
								/>
							</DropStyled>
							<DropStyled>
								<Icon name="paperclip" size={18} />
								<div className="drop-label">
									Professional certificate (optional) —{" "}
									{cert?.name ?? "click to upload"}
								</div>
								<input
									type="file"
									accept="image/*,application/pdf"
									onChange={(e) =>
										setCert(e.target.files?.[0] ?? null)
									}
								/>
							</DropStyled>
							<DropStyled>
								<Icon name="paperclip" size={18} />
								<div className="drop-label">
									Optional extra document —{" "}
									{extra?.name ?? "click to upload"}
								</div>
								<input
									type="file"
									accept="image/*,application/pdf"
									onChange={(e) =>
										setExtra(e.target.files?.[0] ?? null)
									}
								/>
							</DropStyled>
						</DocsStyled>
						{error && <ErrorBoxStyled>{error}</ErrorBoxStyled>}
					</>
				)}

				<ActionsStyled>
					<Button
						variant="ghost"
						size="md"
						onClick={() => setStep(Math.max(0, step - 1))}
						disabled={step === 0}
						icon="chevron-left"
					>
						Back
					</Button>
					{isLast ? (
						<Button
							variant="primary"
							size="md"
							iconRight="check"
							onClick={submit}
							disabled={busy}
						>
							{busy ? "Submitting…" : "Submit application"}
						</Button>
					) : (
						<Button
							variant="primary"
							size="md"
							iconRight="chevron-right"
							onClick={() =>
								setStep(Math.min(STEPS.length - 1, step + 1))
							}
						>
							Continue
						</Button>
					)}
				</ActionsStyled>
			</PanelStyled>
		</PageShell>
	);
}
