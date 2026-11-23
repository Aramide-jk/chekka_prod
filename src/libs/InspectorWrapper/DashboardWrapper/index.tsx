"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import { Button, Eyebrow, Icon, Pill } from "@/components";
import { api, fetcher } from "@/constants";
import { PageShell } from "@/layouts";
import type { IResponseEnvelope } from "@/types";
import {
	EmptyStyled,
	GridStyled,
	QuickLinksStyled,
	RowMainStyled,
	RowSideStyled,
	RowStyled,
	RowTextStyled,
	SectionStyled,
	SideColStyled,
	StatLabelStyled,
	StatStyled,
	StatsRowStyled,
	StatValueStyled,
	ToggleCardStyled,
	ToggleStyled,
} from "./styled";

interface IJob {
	_id: string;
	status: string;
	car: { make: string; model: string; year: number };
	scheduledFor?: string;
	slot?: string;
	price: number;
	currentSection?: string;
}

interface IDashboard {
	stats: { pending: number; active: number; completed: number };
	jobs: IJob[];
	earnings: { released: number; held: number; totalCount: number };
	profile: { availability: { toggleOn: boolean }; rating: number } | null;
	payoutPercent: number;
}

export default function DashboardWrapper() {
	const { data } = useSWR<IResponseEnvelope<IDashboard>>(
		"/api/dashboard/inspector",
		fetcher,
		{ revalidateOnMount: true },
	);
	const [on, setOn] = useState(true);

	useEffect(() => {
		if (data?.data?.profile) {
			setOn(!!data.data.profile.availability?.toggleOn);
		}
	}, [data]);

	const stats = data?.data?.stats ?? { pending: 0, active: 0, completed: 0 };
	const jobs = data?.data?.jobs ?? [];
	const earnings = data?.data?.earnings ?? {
		released: 0,
		held: 0,
		totalCount: 0,
	};
	const rating = data?.data?.profile?.rating ?? 0;
	const payoutFraction = (data?.data?.payoutPercent ?? 65) / 100;

	async function toggle() {
		const next = !on;
		setOn(next);
		try {
			await api().patch("/api/inspector-profiles/availability", {
				toggleOn: next,
			});
			mutate("/api/dashboard/inspector");
		} catch {
			setOn(!next);
		}
	}

	return (
		<PageShell
			eyebrow="Inspector"
			title="Welcome,"
			titleEm="Inspector"
			navTitle="Inspector"
			subtitle="Your inspection queue, schedule, and earnings — all in one place."
			right={
				<Link href="/inspector/schedule">
					<Button variant="secondary" size="md" icon="calendar">
						Manage schedule
					</Button>
				</Link>
			}
		>
			<ToggleCardStyled data-testid="availability-toggle">
				<div>
					<Eyebrow $gold className="eyebrow">
						Availability
					</Eyebrow>
					<div className="availability-sub">
						{on
							? "You're visible to buyers in your city."
							: "You're hidden from search. No new job offers."}
					</div>
				</div>
				<ToggleStyled
					$on={on}
					onClick={toggle}
					aria-label="Toggle availability"
				/>
			</ToggleCardStyled>

			<StatsRowStyled>
				<StatStyled>
					<StatLabelStyled>Pending offers</StatLabelStyled>
					<StatValueStyled>{stats.pending}</StatValueStyled>
				</StatStyled>
				<StatStyled>
					<StatLabelStyled>Active jobs</StatLabelStyled>
					<StatValueStyled>{stats.active}</StatValueStyled>
				</StatStyled>
				<StatStyled>
					<StatLabelStyled>Completed</StatLabelStyled>
					<StatValueStyled>{stats.completed}</StatValueStyled>
				</StatStyled>
				<StatStyled>
					<StatLabelStyled>Rating · Earned</StatLabelStyled>
					<StatValueStyled>{rating.toFixed(1)}</StatValueStyled>
				</StatStyled>
			</StatsRowStyled>

			<GridStyled>
				<SectionStyled>
					<Eyebrow $gold className="eyebrow-queue">
						Job queue
					</Eyebrow>
					{jobs.length === 0 && <EmptyStyled>No jobs assigned yet.</EmptyStyled>}
					{jobs.map((j) => (
						<RowStyled key={j._id}>
							<RowMainStyled>
								<Icon name="car" size={20} />
								<RowTextStyled>
									<div>
										{j.car.make} {j.car.model} {j.car.year}
									</div>
									<div>
										{j.scheduledFor
											? `${new Date(j.scheduledFor).toLocaleDateString()} · ${j.slot ?? ""}`
											: j.status.replace(/_/g, " ")}
									</div>
								</RowTextStyled>
							</RowMainStyled>
							<RowSideStyled>
								<span className="payout">
									₦
									{Math.floor(
										j.price * payoutFraction,
									).toLocaleString()}
								</span>
								<Pill
									tone={
										j.status === "in_progress"
											? "gold"
											: j.status === "completed"
												? "good"
												: "ghost"
									}
								>
									{j.status.replace(/_/g, " ")}
								</Pill>
								<Link href={`/inspector/inspections/${j._id}`}>
									<Button variant="secondary" size="sm">
										Open
									</Button>
								</Link>
							</RowSideStyled>
						</RowStyled>
					))}
				</SectionStyled>

				<SideColStyled>
					<SectionStyled>
						<Eyebrow $gold className="eyebrow-card">
							Earnings
						</Eyebrow>
						<div className="earnings-label">Released</div>
						<div className="earnings-released">
							₦{earnings.released.toLocaleString()}
						</div>
						<div className="earnings-label-held">Held</div>
						<div className="earnings-held">
							₦{earnings.held.toLocaleString()}
						</div>
					</SectionStyled>

					<SectionStyled>
						<Eyebrow $gold className="eyebrow-card">
							Quick links
						</Eyebrow>
						<QuickLinksStyled>
							<Link href="/inspector/schedule">
								<Button
									variant="secondary"
									size="md"
									fullWidth
									icon="calendar"
								>
									Schedule
								</Button>
							</Link>
							<Link href="/inspector/earnings">
								<Button
									variant="secondary"
									size="md"
									fullWidth
									icon="naira"
								>
									Earnings
								</Button>
							</Link>
						</QuickLinksStyled>
					</SectionStyled>
				</SideColStyled>
			</GridStyled>
		</PageShell>
	);
}
