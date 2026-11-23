"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { Eyebrow, Icon, Pill } from "@/components";
import { fetcher } from "@/constants";
import { PageShell } from "@/layouts";
import type { IResponseEnvelope } from "@/types";
import {
	EmptyStyled,
	GridStyled,
	NowStyled,
	PhotoGridStyled,
	PhotoLabelStyled,
	PhotoTileStyled,
	SectionListStyled,
	SectionRowStyled,
	SectionStyled,
	SideStyled,
	StickyBarStyled,
} from "./styled";

interface IProps {
	id: string;
}

interface IPhoto {
	_id: string;
	section: "exterior" | "interior" | "engine" | "test_drive" | "other";
	url: string;
	note?: string;
	sequence: number;
	takenAt: string;
}

interface IInspection {
	_id: string;
	currentSection?: string;
	startedAt?: string;
	car: { make: string; model: string; year: number };
	photoCount: number;
}

const SECTIONS: Array<IPhoto["section"]> = [
	"exterior",
	"interior",
	"engine",
	"test_drive",
	"other",
];

const SECTION_LABEL: Record<IPhoto["section"], string> = {
	exterior: "Exterior",
	interior: "Interior",
	engine: "Engine",
	test_drive: "Test Drive",
	other: "Other",
};

function elapsedSince(s?: string) {
	if (!s) return "—";
	const ms = Date.now() - new Date(s).getTime();
	const min = Math.max(0, Math.floor(ms / 60_000));
	return `${min} min elapsed`;
}

export default function LiveFeedWrapper({ id }: IProps) {
	const isSynthetic = id === "sample" || id === "shared";

	const { data: insData } = useSWR<
		IResponseEnvelope<{ inspection: IInspection }>
	>(isSynthetic ? null : `/api/inspections/${id}`, fetcher, {
		revalidateOnMount: true,
	});

	const [photos, setPhotos] = useState<IPhoto[]>([]);
	const [currentSection, setCurrentSection] = useState<string | null>(null);
	const [connected, setConnected] = useState(false);
	const esRef = useRef<EventSource | null>(null);

	useEffect(() => {
		if (isSynthetic || typeof window === "undefined") return;
		const es = new EventSource(`/api/inspections/${id}/live`);
		esRef.current = es;
		es.addEventListener("hello", () => setConnected(true));
		es.addEventListener("snapshot", (ev) => {
			try {
				const data = JSON.parse((ev as MessageEvent).data) as {
					photos: IPhoto[];
					currentSection: string | null;
				};
				setPhotos(data.photos);
				setCurrentSection(data.currentSection);
			} catch {
				// ignore
			}
		});
		es.addEventListener("photo", (ev) => {
			try {
				const data = JSON.parse((ev as MessageEvent).data) as {
					photo?: IPhoto;
				};
				const photo = data.photo;
				if (!photo) return;
				setPhotos((prev) =>
					prev.find((p) => p._id === photo._id)
						? prev
						: [...prev, photo],
				);
			} catch {
				// ignore
			}
		});
		es.addEventListener("section", (ev) => {
			try {
				const data = JSON.parse((ev as MessageEvent).data) as {
					section?: string;
				};
				if (data.section) setCurrentSection(data.section);
			} catch {
				// ignore
			}
		});
		es.onerror = () => setConnected(false);
		return () => {
			es.close();
			esRef.current = null;
		};
	}, [id, isSynthetic]);

	const ins = insData?.data?.inspection;
	const total = photos.length || ins?.photoCount || 0;

	const counts = useMemo(() => {
		const c: Record<string, number> = {};
		for (const p of photos) c[p.section] = (c[p.section] ?? 0) + 1;
		return c;
	}, [photos]);

	const title = ins ? `${ins.car.make} ${ins.car.model}` : "Live feed";

	return (
		<PageShell
			eyebrow={`Live · ${id}`}
			title={title}
			titleEm="live now"
			navTitle="Live feed"
			subtitle="Every photo the inspector takes streams here in real time."
			right={
				<Pill tone="gold" dot={connected}>
					{total} photos so far
				</Pill>
			}
		>
			<StickyBarStyled>
				<div>
					<Eyebrow $gold>Currently examining</Eyebrow>
					<NowStyled>{currentSection ?? "Waiting for inspector…"}</NowStyled>
				</div>
				<Pill tone={connected ? "gold" : "ghost"} dot>
					{connected ? "Live" : "Connecting…"}
				</Pill>
			</StickyBarStyled>

			<GridStyled>
				<SectionStyled data-testid="live-photos">
					<Eyebrow $gold className="eyebrow-head">
						Stream
					</Eyebrow>
					{photos.length === 0 ? (
						<EmptyStyled>
							No photos yet. The inspector will start capturing
							soon.
						</EmptyStyled>
					) : (
						<PhotoGridStyled>
							{photos.map((p) => (
								<PhotoTileStyled key={p._id}>
									<Icon name="camera" size={20} />
									<PhotoLabelStyled>
										{SECTION_LABEL[p.section]} · #
										{p.sequence}
									</PhotoLabelStyled>
								</PhotoTileStyled>
							))}
						</PhotoGridStyled>
					)}
				</SectionStyled>

				<SideStyled>
					<SectionStyled>
						<Eyebrow $gold className="eyebrow-head">
							Sections
						</Eyebrow>
						<SectionListStyled>
							{SECTIONS.map((s) => (
								<SectionRowStyled
									key={s}
									$on={
										currentSection
											?.toLowerCase()
											.includes(s) ?? false
									}
								>
									<span>{SECTION_LABEL[s]}</span>
									<span>{counts[s] ?? 0} photos</span>
								</SectionRowStyled>
							))}
						</SectionListStyled>
					</SectionStyled>

					<SectionStyled>
						<Eyebrow $gold className="eyebrow-head">
							Inspector
						</Eyebrow>
						<div className="inspector-name">Assigned inspector</div>
						<div className="inspector-elapsed">
							{elapsedSince(ins?.startedAt)}
						</div>
					</SectionStyled>
				</SideStyled>
			</GridStyled>
		</PageShell>
	);
}
