"use client";

import { useContext, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Avatar, Button, Icon, Select } from "@/components";
import { NIGERIAN_BANKS, api, fetcher, getErrorMessage } from "@/constants";
import { AppContextProvider } from "@/hooks";
import { PageShell } from "@/layouts";
import type { IResponseEnvelope } from "@/types";
import {
	AvatarRowStyled,
	FieldStyled,
	FormGridStyled,
	NoteStyled,
	PanelStyled,
	PanelTitleStyled,
	SaveRowStyled,
	SpecChipStyled,
	SpecChipsStyled,
	StatusStyled,
} from "./styled";

const CITY_OPTIONS = ["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan"];

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
];

interface IInspectorProfile {
	bio?: string;
	yearsExperience?: number;
	specialisations?: string[];
	payoutAccount?: {
		bankCode?: string;
		accountNumber?: string;
		accountName?: string;
		status?: "pending" | "verified" | "invalid";
	};
}

export default function SettingsWrapper() {
	const { user, setUser } = useContext(AppContextProvider);
	const isInspector = user?.role === "inspector";

	// --- account fields ---
	const [fullName, setFullName] = useState(user?.fullName ?? "");
	const [phone, setPhone] = useState(user?.phone ?? "");
	const [city, setCity] = useState(user?.city ?? "Lagos");
	const [savingAccount, setSavingAccount] = useState(false);
	const [accountMsg, setAccountMsg] = useState<string | null>(null);
	const [accountErr, setAccountErr] = useState<string | null>(null);

	// --- avatar ---
	const fileRef = useRef<HTMLInputElement | null>(null);
	const [uploading, setUploading] = useState(false);
	const [avatarErr, setAvatarErr] = useState<string | null>(null);

	// --- inspector profile fields ---
	const { data: profileData, mutate: refreshProfile } = useSWR<
		IResponseEnvelope<{ profile: IInspectorProfile | null }>
	>(isInspector ? "/api/inspector-profiles/me" : null, fetcher);
	const [bio, setBio] = useState("");
	const [years, setYears] = useState(0);
	const [specialisations, setSpecialisations] = useState<string[]>([]);
	const [savingProfile, setSavingProfile] = useState(false);
	const [profileMsg, setProfileMsg] = useState<string | null>(null);
	const [profileErr, setProfileErr] = useState<string | null>(null);

	// --- inspector bank payout fields ---
	const [bankCode, setBankCode] = useState("");
	const [accountNumber, setAccountNumber] = useState("");
	const [accountName, setAccountName] = useState("");
	const [savingBank, setSavingBank] = useState(false);
	const [bankMsg, setBankMsg] = useState<string | null>(null);
	const [bankErr, setBankErr] = useState<string | null>(null);

	// Prefill inspector fields once the profile loads.
	const profile = profileData?.data?.profile;
	useEffect(() => {
		if (!profile) return;
		setBio(profile.bio ?? "");
		setYears(profile.yearsExperience ?? 0);
		setSpecialisations(profile.specialisations ?? []);
		if (profile.payoutAccount) {
			setBankCode(profile.payoutAccount.bankCode ?? "");
			setAccountNumber(profile.payoutAccount.accountNumber ?? "");
			setAccountName(profile.payoutAccount.accountName ?? "");
		}
	}, [profile]);

	function toggleSpecialisation(s: string) {
		setSpecialisations((prev) =>
			prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
		);
	}

	async function onPickAvatar(file: File | null) {
		if (!file || uploading) return;
		setUploading(true);
		setAvatarErr(null);
		try {
			const fd = new FormData();
			fd.set("avatar", file);
			const res = await api().post("/api/users/me/avatar", fd);
			const updated = res.data?.data?.user;
			if (updated) setUser(updated);
		} catch (err) {
			setAvatarErr(getErrorMessage(err, "Could not upload photo"));
		} finally {
			setUploading(false);
			if (fileRef.current) fileRef.current.value = "";
		}
	}

	async function saveAccount() {
		if (savingAccount) return;
		setSavingAccount(true);
		setAccountMsg(null);
		setAccountErr(null);
		try {
			const res = await api().patch("/api/users/me", {
				fullName,
				phone,
				city,
			});
			const updated = res.data?.data?.user;
			if (updated) setUser(updated);
			setAccountMsg("Saved.");
		} catch (err) {
			setAccountErr(getErrorMessage(err, "Could not save changes"));
		} finally {
			setSavingAccount(false);
		}
	}

	async function saveProfile() {
		if (savingProfile) return;
		setSavingProfile(true);
		setProfileMsg(null);
		setProfileErr(null);
		try {
			await api().patch("/api/inspector-profiles/me", {
				bio,
				yearsExperience: years,
				specialisations,
			});
			await refreshProfile();
			setProfileMsg("Saved.");
		} catch (err) {
			setProfileErr(getErrorMessage(err, "Could not save profile"));
		} finally {
			setSavingProfile(false);
		}
	}

	async function saveBank() {
		if (savingBank) return;
		if (!bankCode) {
			setBankErr("Please select your bank.");
			return;
		}
		if (!/^\d{10}$/.test(accountNumber.trim())) {
			setBankErr("Please enter a valid 10-digit NUBAN account number.");
			return;
		}
		if (accountName.trim().length < 2) {
			setBankErr(
				"Please enter the account name as registered with your bank.",
			);
			return;
		}
		setSavingBank(true);
		setBankMsg(null);
		setBankErr(null);
		try {
			await api().patch("/api/inspector-profiles/me", {
				payoutAccount: {
					bankCode: bankCode.trim(),
					accountNumber: accountNumber.trim(),
					accountName: accountName.trim(),
				},
			});
			await refreshProfile();
			setBankMsg("Bank details saved.");
		} catch (err) {
			setBankErr(getErrorMessage(err, "Could not save bank details"));
		} finally {
			setSavingBank(false);
		}
	}

	return (
		<PageShell
			eyebrow="Your account"
			title="Settings"
			titleEm="& profile"
			navTitle="Settings"
			subtitle="Update your details, photo, and how you appear across Chekka."
			showAccount
		>
			<PanelStyled>
				<PanelTitleStyled>Profile photo</PanelTitleStyled>
				<AvatarRowStyled>
					<Avatar
						name={fullName || user?.fullName || "?"}
						src={user?.avatar}
						size={72}
					/>
					<div className="avatar-actions">
						<Button
							variant="secondary"
							size="sm"
							icon="paperclip"
							disabled={uploading}
							onClick={() => fileRef.current?.click()}
						>
							{uploading ? "Uploading…" : "Change photo"}
						</Button>
						<NoteStyled>
							{isInspector
								? "A clear headshot builds buyer trust — recommended for inspectors."
								: "Optional — add a photo so inspectors recognise you."}
						</NoteStyled>
						{avatarErr && (
							<StatusStyled $err>{avatarErr}</StatusStyled>
						)}
					</div>
					<input
						ref={fileRef}
						type="file"
						accept="image/*"
						hidden
						onChange={(e) =>
							onPickAvatar(e.target.files?.[0] ?? null)
						}
					/>
				</AvatarRowStyled>
			</PanelStyled>

			<PanelStyled>
				<PanelTitleStyled>Account details</PanelTitleStyled>
				<FormGridStyled>
					<FieldStyled>
						Full name
						<input
							type="text"
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
						/>
					</FieldStyled>
					<FieldStyled>
						Phone
						<input
							type="tel"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							placeholder="+234..."
						/>
					</FieldStyled>
					<FieldStyled>
						Email
						<input
							type="email"
							value={user?.email ?? ""}
							disabled
						/>
					</FieldStyled>
					<FieldStyled as="div">
						<span className="field-label">City</span>
						<Select
							ariaLabel="Select your city"
							value={city}
							onChange={setCity}
							placeholder="Select city…"
							options={CITY_OPTIONS.map((c) => ({
								value: c,
								label: c,
							}))}
						/>
					</FieldStyled>
				</FormGridStyled>
				<SaveRowStyled>
					<Button
						variant="primary"
						size="md"
						iconRight="check"
						disabled={savingAccount}
						onClick={saveAccount}
					>
						{savingAccount ? "Saving…" : "Save changes"}
					</Button>
					{accountMsg && <StatusStyled>{accountMsg}</StatusStyled>}
					{accountErr && (
						<StatusStyled $err>{accountErr}</StatusStyled>
					)}
				</SaveRowStyled>
			</PanelStyled>

			{isInspector && (
				<>
					<PanelStyled>
						<PanelTitleStyled>Inspector profile</PanelTitleStyled>
						<FormGridStyled>
							<FieldStyled>
								Years of experience
								<input
									type="number"
									min={0}
									value={years}
									onChange={(e) =>
										setYears(Number(e.target.value) || 0)
									}
								/>
							</FieldStyled>
							<FieldStyled className="span-all" as="div">
								<span className="field-label">
									Specialisations
								</span>
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
							</FieldStyled>
							<FieldStyled className="span-all">
								Short bio
								<textarea
									rows={3}
									value={bio}
									onChange={(e) => setBio(e.target.value)}
									placeholder="A line or two about your background…"
								/>
							</FieldStyled>
						</FormGridStyled>
						<SaveRowStyled>
							<Button
								variant="primary"
								size="md"
								iconRight="check"
								disabled={savingProfile}
								onClick={saveProfile}
							>
								{savingProfile ? "Saving…" : "Save profile"}
							</Button>
							{profileMsg && (
								<StatusStyled>{profileMsg}</StatusStyled>
							)}
							{profileErr && (
								<StatusStyled $err>{profileErr}</StatusStyled>
							)}
						</SaveRowStyled>
					</PanelStyled>

					<PanelStyled>
						<PanelTitleStyled>Payout bank account</PanelTitleStyled>
						<NoteStyled style={{ marginBottom: 16 }}>
							<Icon name="check" size={14} /> Chekka deposits your
							inspection earnings directly into this account via
							Paystack transfers.
						</NoteStyled>
						<FormGridStyled>
							<FieldStyled as="div">
								<span className="field-label">Bank name</span>
								<Select
									ariaLabel="Select your bank"
									value={bankCode}
									onChange={setBankCode}
									placeholder="Choose bank…"
									options={NIGERIAN_BANKS}
								/>
							</FieldStyled>
							<FieldStyled>
								10-digit NUBAN account number
								<input
									type="text"
									maxLength={10}
									placeholder="0123456789"
									value={accountNumber}
									onChange={(e) =>
										setAccountNumber(
											e.target.value.replace(/\D/g, ""),
										)
									}
								/>
							</FieldStyled>
							<FieldStyled className="span-all">
								Account name (as registered with your bank)
								<input
									type="text"
									placeholder="e.g. Babatunde Adebayo"
									value={accountName}
									onChange={(e) =>
										setAccountName(e.target.value)
									}
								/>
							</FieldStyled>
						</FormGridStyled>
						<SaveRowStyled>
							<Button
								variant="primary"
								size="md"
								iconRight="check"
								disabled={savingBank}
								onClick={saveBank}
							>
								{savingBank ? "Saving…" : "Save bank details"}
							</Button>
							{bankMsg && <StatusStyled>{bankMsg}</StatusStyled>}
							{bankErr && (
								<StatusStyled $err>{bankErr}</StatusStyled>
							)}
						</SaveRowStyled>
					</PanelStyled>
				</>
			)}

			{!user && (
				<NoteStyled>
					<Icon name="user" size={14} /> Sign in to manage your
					settings.
				</NoteStyled>
			)}
		</PageShell>
	);
}
