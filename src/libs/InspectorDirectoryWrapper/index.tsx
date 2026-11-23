"use client";

import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { Avatar, Button, Eyebrow, Pill, Select, Stars } from "@/components";
import { fetcher } from "@/constants";
import { PageShell } from "@/layouts";
import type { IResponseEnvelope } from "@/types";
import {
	CardStyled,
	CardTopStyled,
	EmptyStyled,
	FilterRowStyled,
	GridStyled,
	IntroRowStyled,
	MetaStyled,
	SpecsStyled,
} from "./styled";

const CITIES = ["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan"];

interface IDirectoryInspector {
	_id: string;
	userId?: string;
	user?: { fullName?: string; city?: string };
	rating: number;
	totalCompleted: number;
	specialisations?: string[];
	certificateApprovedAt?: string | null;
}

function initials(name?: string): string {
	if (!name) return "?";
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function InspectorDirectoryWrapper() {
	const [city, setCity] = useState<string>("");

	const { data, isLoading } = useSWR<
		IResponseEnvelope<{ inspectors: IDirectoryInspector[] }>
	>(
		city
			? `/api/inspectors?city=${encodeURIComponent(city)}&limit=50`
			: `/api/inspectors?limit=50`,
		fetcher,
		{ revalidateOnMount: true },
	);
	const inspectors = data?.data?.inspectors ?? [];

	return (
		<PageShell
			eyebrow="Find an inspector"
			title="Browse certified"
			titleEm="inspectors"
			navTitle="Inspectors"
			subtitle="Pick an inspector and book them directly — or start a booking from scratch and we'll match you."
			showAccount
		>
			<IntroRowStyled>
				<Link href="/book/1">
					<Button variant="primary" size="md" icon="plus">
						Book from scratch
					</Button>
				</Link>
				<Link href="/book/1?urgent=1">
					<Button variant="secondary" size="md" icon="clock">
						Urgent inspection
					</Button>
				</Link>
			</IntroRowStyled>

			<FilterRowStyled>
				<Eyebrow $gold>
					{inspectors.length} available
					{city ? ` in ${city}` : " nationwide"}
				</Eyebrow>
				<div className="filter-select">
					<Select
						ariaLabel="Filter by city"
						value={city}
						onChange={setCity}
						placeholder="All cities"
						options={[
							{ value: "", label: "All cities" },
							...CITIES.map((c) => ({ value: c, label: c })),
						]}
					/>
				</div>
			</FilterRowStyled>

			{!isLoading && inspectors.length === 0 && (
				<EmptyStyled>
					No inspectors available{city ? ` in ${city}` : ""} right
					now. Try another city or book from scratch — we'll match you.
				</EmptyStyled>
			)}

			<GridStyled>
				{inspectors.map((ins) => {
					const id = ins.userId ?? ins._id;
					const certified = !!ins.certificateApprovedAt;
					return (
						<CardStyled key={ins._id}>
							<CardTopStyled>
								<Avatar
									name={initials(ins.user?.fullName)}
									size={48}
								/>
								<div className="who">
									<div className="name">
										{ins.user?.fullName ?? "Inspector"}
									</div>
									<Pill tone={certified ? "good" : "info"}>
										{certified ? "Certified" : "Verified"}
									</Pill>
								</div>
							</CardTopStyled>

							<MetaStyled>
								<span className="rating">
									<Stars rating={ins.rating || 0} />
									<span>
										{(ins.rating || 0).toFixed(1)}
									</span>
								</span>
								<span className="dot">·</span>
								<span>{ins.totalCompleted} inspections</span>
								{ins.user?.city && (
									<>
										<span className="dot">·</span>
										<span>{ins.user.city}</span>
									</>
								)}
							</MetaStyled>

							{ins.specialisations &&
								ins.specialisations.length > 0 && (
									<SpecsStyled>
										{ins.specialisations
											.slice(0, 4)
											.map((s) => (
												<Pill key={s} tone="ghost">
													{s}
												</Pill>
											))}
									</SpecsStyled>
								)}

							<Link
								href={`/book/1?inspector=${encodeURIComponent(id)}`}
								className="book-link"
							>
								<Button
									variant="primary"
									size="sm"
									fullWidth
									iconRight="chevron-right"
								>
									Book this inspector
								</Button>
							</Link>
						</CardStyled>
					);
				})}
			</GridStyled>
		</PageShell>
	);
}
