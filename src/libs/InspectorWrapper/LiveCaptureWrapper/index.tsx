"use client";

import { useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { Button, Eyebrow, Icon, Pill } from "@/components";
import { api, fetcher, getErrorMessage } from "@/constants";
import { PageShell } from "@/layouts";
import type { IResponseEnvelope } from "@/types";
import {
	CapturesStyled,
	ComposerStyled,
	ErrorBoxStyled,
	FileInputStyled,
	GridStyled,
	NoticeBoxStyled,
	PendingThumbStyled,
	PickStyled,
	SectionPickerStyled,
	SectionStyled,
	SidebarStyled,
	StageStyled,
	ThumbStyled,
} from "./styled";

interface IProps {
	id: string;
	// Admin-configured minimum photos (Inspection Rules). Falls back to 30.
	minPhotos?: number;
}

type SectionKey = "exterior" | "interior" | "engine" | "test_drive" | "other";

const SECTIONS: Array<{ k: SectionKey; label: string }> = [
	{ k: "exterior", label: "Exterior" },
	{ k: "interior", label: "Interior" },
	{ k: "engine", label: "Engine" },
	{ k: "test_drive", label: "Test Drive" },
	{ k: "other", label: "Other" },
];

interface IPhoto {
	_id: string;
	section: SectionKey;
	sequence: number;
	url: string;
}

export default function LiveCaptureWrapper({ id, minPhotos }: IProps) {
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [current, setCurrent] = useState<SectionKey>("exterior");
	const [note, setNote] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	// Pending uploads = optimistic placeholder tiles shown while the POST is
	// in flight. Stored as nonces so each tile has a stable React key without
	// relying on the array index. Cleared on POST resolution.
	const [pending, setPending] = useState<string[]>([]);

	const { data: photoData, mutate: refreshPhotos } = useSWR<
		IResponseEnvelope<{ photos: IPhoto[] }>
	>(`/api/inspections/${id}/photos`, fetcher, { revalidateOnMount: true });
	const photos = photoData?.data?.photos ?? [];
	const count = photos.length;
	const min = minPhotos ?? 30;

	async function setSection(s: SectionKey) {
		setCurrent(s);
		try {
			await api().patch(`/api/inspections/${id}`, {
				currentSection: SECTIONS.find((x) => x.k === s)?.label ?? s,
				...(count === 0
					? {
							startedAt: new Date().toISOString(),
							status: "in_progress",
						}
					: {}),
			});
		} catch {
			// non-fatal
		}
	}

	// Returns true when the server reported the upload as a duplicate of an
	// already-captured image (same bytes) — no new tile was created.
	async function uploadOne(
		file?: File,
		attachNote = false,
	): Promise<boolean> {
		const fd = new FormData();
		fd.set("section", current);
		if (attachNote && note) fd.set("note", note);
		if (file) fd.set("photo", file);
		// Don't set Content-Type — the browser must inject the boundary
		// parameter. axios will fill it in for FormData bodies.
		const res = await api().post(`/api/inspections/${id}/photos`, fd);
		return res.data?.data?.duplicate === true;
	}

	// Handles one or many files. Multiple files selected at once are uploaded
	// sequentially so their capture sequence stays in picking order, each with
	// its own optimistic placeholder tile.
	async function capture(files?: File[] | File) {
		if (busy) return;
		const list = Array.isArray(files) ? files : files ? [files] : [];
		setBusy(true);
		setError(null);
		const nonces = (list.length ? list : [null]).map(
			(_, i) =>
				`pending-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
		);
		setPending((p) => [...p, ...nonces]);
		setNotice(null);
		try {
			let duplicates = 0;
			if (list.length === 0) {
				if (await uploadOne(undefined, true)) duplicates++;
			} else {
				for (let i = 0; i < list.length; i++) {
					// Only attach the typed note to the first photo of a batch.
					if (await uploadOne(list[i], i === 0)) duplicates++;
				}
			}
			setNote("");
			await refreshPhotos();
			if (duplicates > 0) {
				setNotice(
					duplicates === 1
						? "That image was already uploaded — skipped the duplicate."
						: `${duplicates} images were already uploaded — duplicates skipped.`,
				);
			}
		} catch (err) {
			setError(getErrorMessage(err, "Capture failed"));
		} finally {
			setPending((p) => p.filter((n) => !nonces.includes(n)));
			setBusy(false);
		}
	}

	async function removePhoto(photoId: string) {
		if (busy) return;
		setBusy(true);
		setError(null);
		setNotice(null);
		try {
			await api().delete(
				`/api/inspections/${id}/photos?photoId=${encodeURIComponent(photoId)}`,
			);
			await refreshPhotos();
		} catch (err) {
			setError(getErrorMessage(err, "Could not remove photo"));
		} finally {
			setBusy(false);
		}
	}

	async function completePhysical() {
		try {
			await api().patch(`/api/inspections/${id}`, {
				status: "report_processing",
				completedPhysicalAt: new Date().toISOString(),
			});
			window.location.href = `/inspector/inspections/${id}/report`;
		} catch (err) {
			setError(getErrorMessage(err, "Could not finish"));
		}
	}

	const sectionCounts = useMemo(() => {
		const c: Record<string, number> = {};
		for (const p of photos) c[p.section] = (c[p.section] ?? 0) + 1;
		return c;
	}, [photos]);

	return (
		<PageShell
			eyebrow={`Capture · ${id}`}
			title="Live capture"
			titleEm="in progress"
			navTitle="Capture"
			subtitle="Every photo streams to the buyer in real time. Aim for 30+ across all sections."
			right={
				<Pill
					tone={count >= min ? "good" : "gold"}
					dot={count < min}
					data-testid="photo-count-pill"
				>
					{count}/{min} photos
				</Pill>
			}
		>
			<GridStyled>
				<SectionStyled>
					<Eyebrow $gold className="eyebrow-spaced">
						Currently examining
					</Eyebrow>
					<SectionPickerStyled data-testid="section-picker">
						{SECTIONS.map((s) => (
							<PickStyled
								key={s.k}
								$on={current === s.k}
								onClick={() => setSection(s.k)}
								type="button"
							>
								{s.label}
							</PickStyled>
						))}
					</SectionPickerStyled>
					<StageStyled>
						<div className="stage-inner">
							<Icon name="camera" size={36} />
							<div className="stage-caption">
								Tap capture ·{" "}
								{SECTIONS.find((x) => x.k === current)?.label}
							</div>
						</div>
					</StageStyled>
					<ComposerStyled>
						<input
							placeholder="Optional note for this photo…"
							value={note}
							onChange={(e) => setNote(e.target.value)}
						/>
						<FileInputStyled
							ref={fileInputRef}
							type="file"
							accept="image/*"
							multiple
							onChange={(e) => {
								const files = Array.from(e.target.files ?? []);
								if (files.length) capture(files);
								if (fileInputRef.current)
									fileInputRef.current.value = "";
							}}
						/>
						<Button
							variant="primary"
							size="md"
							icon="camera"
							disabled={busy}
							onClick={() => {
								if (fileInputRef.current) {
									fileInputRef.current.click();
								} else {
									capture();
								}
							}}
						>
							{busy ? "Uploading…" : "Capture (one or many)"}
						</Button>
					</ComposerStyled>
					{error && <ErrorBoxStyled>{error}</ErrorBoxStyled>}
					{notice && <NoticeBoxStyled>{notice}</NoticeBoxStyled>}
					<CapturesStyled data-testid="captures">
						{photos.map((p) => (
							<ThumbStyled
								key={p._id}
								data-testid="capture-thumb"
							>
								{p.url ? (
									// biome-ignore lint/performance/noImgElement: signed S3 URLs change every hour; configuring next/image remote patterns per env is more friction than the LCP gain on a private inspector view.
									<img
										src={p.url}
										alt={`Capture ${p.sequence}`}
									/>
								) : (
									<Icon name="camera" size={14} />
								)}
								<button
									type="button"
									className="thumb-del"
									aria-label="Remove photo"
									title="Remove photo"
									disabled={busy}
									onClick={() => removePhoto(p._id)}
								>
									<Icon name="trash" size={12} />
								</button>
							</ThumbStyled>
						))}
						{pending.map((nonce) => (
							<PendingThumbStyled
								key={nonce}
								data-testid="capture-thumb-pending"
							>
								<Icon name="camera" size={14} />
							</PendingThumbStyled>
						))}
					</CapturesStyled>
				</SectionStyled>

				<SidebarStyled>
					<SectionStyled>
						<Eyebrow $gold className="eyebrow-spaced">
							Progress
						</Eyebrow>
						{SECTIONS.map((s) => (
							<div key={s.k} className="progress-row">
								<span className="progress-label">
									{s.label}
								</span>
								<span className="progress-value">
									{s.k === current
										? "now"
										: `${sectionCounts[s.k] ?? 0} photos`}
								</span>
							</div>
						))}
					</SectionStyled>
					<Button
						variant="primary"
						size="md"
						fullWidth
						iconRight="chevron-right"
						disabled={count < min}
						onClick={completePhysical}
					>
						{count < min
							? `Need ${min - count} more photos`
							: "Complete physical inspection"}
					</Button>
				</SidebarStyled>
			</GridStyled>
		</PageShell>
	);
}
