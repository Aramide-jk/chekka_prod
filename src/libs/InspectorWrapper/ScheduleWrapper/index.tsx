"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import useSWR, { mutate } from "swr";
import { Button, Eyebrow } from "@/components";
import { api, fetcher, getErrorMessage } from "@/constants";
import { PageShell } from "@/layouts";
import type { IResponseEnvelope } from "@/types";
import {
	DayGridStyled,
	DayLabelStyled,
	ErrorBoxStyled,
	GridStyled,
	SavedStyled,
	SectionStyled,
	SlotBtnStyled,
} from "./styled";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY_LABEL: Record<(typeof DAYS)[number], string> = {
	mon: "Mon",
	tue: "Tue",
	wed: "Wed",
	thu: "Thu",
	fri: "Fri",
	sat: "Sat",
	sun: "Sun",
};
const SLOTS = ["09:00", "11:00", "14:00", "16:00"] as const;

interface IProfile {
	schedule: {
		weekly: Record<
			string,
			{ active: boolean; slots: Array<{ time: string; on: boolean }> }
		>;
		blockedDates: string[];
	};
}

function defaultWeekly() {
	const out: IProfile["schedule"]["weekly"] = {};
	for (const d of DAYS) {
		out[d] = {
			active: d !== "sun",
			slots: SLOTS.map((time) => ({ time, on: true })),
		};
	}
	return out;
}

export default function ScheduleWrapper() {
	const { data } = useSWR<IResponseEnvelope<{ profile: IProfile | null }>>(
		"/api/inspector-profiles/me",
		fetcher,
		{ revalidateOnMount: true },
	);
	const profile = data?.data?.profile;
	const [weekly, setWeekly] = useState<IProfile["schedule"]["weekly"]>(() =>
		defaultWeekly(),
	);
	const [savedAt, setSavedAt] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (profile?.schedule?.weekly) {
			const fromServer = profile.schedule
				.weekly as IProfile["schedule"]["weekly"];
			const merged = defaultWeekly();
			for (const d of DAYS) {
				if (fromServer[d]) merged[d] = fromServer[d];
			}
			setWeekly(merged);
		}
	}, [profile]);

	function isOn(d: (typeof DAYS)[number], time: string) {
		return !!weekly[d]?.slots.find((s) => s.time === time)?.on;
	}

	async function toggle(day: (typeof DAYS)[number], time: string) {
		const next = JSON.parse(
			JSON.stringify(weekly),
		) as IProfile["schedule"]["weekly"];
		const slot = next[day].slots.find((s) => s.time === time);
		if (slot) slot.on = !slot.on;
		setWeekly(next);
		try {
			await api().patch("/api/inspector-profiles/schedule", {
				weekly: next,
			});
			setSavedAt(Date.now());
			setError(null);
			mutate("/api/inspector-profiles/me");
		} catch (err) {
			setError(getErrorMessage(err, "Could not save schedule"));
		}
	}

	const savedRecent = useMemo(
		() => !!savedAt && Date.now() - savedAt < 4000,
		[savedAt],
	);

	return (
		<PageShell
			eyebrow="Schedule"
			title="Your weekly"
			titleEm="availability"
			navTitle="Schedule"
			subtitle="Toggle the slots you can be reached. Buyers only see what's on."
		>
			<GridStyled>
				<SectionStyled data-testid="schedule-grid">
					<Eyebrow $gold className="section-eyebrow">
						Weekly recurring
					</Eyebrow>
					<DayGridStyled>
						<div></div>
						{SLOTS.map((s) => (
							<DayLabelStyled key={s} className="slot-head">
								{s}
							</DayLabelStyled>
						))}
						{DAYS.map((d) => (
							<Fragment key={d}>
								<DayLabelStyled>{DAY_LABEL[d]}</DayLabelStyled>
								{SLOTS.map((s) => (
									<SlotBtnStyled
										key={`${d}-${s}`}
										$on={isOn(d, s)}
										onClick={() => toggle(d, s)}
										type="button"
									>
										{isOn(d, s) ? "On" : "Off"}
									</SlotBtnStyled>
								))}
							</Fragment>
						))}
					</DayGridStyled>
					{savedRecent && <SavedStyled>Saved</SavedStyled>}
					{error && <ErrorBoxStyled>{error}</ErrorBoxStyled>}
				</SectionStyled>

				<SectionStyled>
					<Eyebrow $gold className="blocked-eyebrow">
						Blocked dates
					</Eyebrow>
					<div className="blocked-copy">
						Block specific dates from the calendar above. Coming
						soon.
					</div>
					<div className="blocked-action">
						<Button
							variant="secondary"
							size="sm"
							icon="plus"
							fullWidth
							disabled
						>
							Add blocked date
						</Button>
					</div>
				</SectionStyled>
			</GridStyled>
		</PageShell>
	);
}
