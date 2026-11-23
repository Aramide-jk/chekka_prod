"use client";

import { useEffect, useState } from "react";
import { Avatar, Eyebrow, Photo, type PhotoKind } from "@/components";
import {
	DotStyled,
	MonoStyled,
	NoteCardStyled,
	PhotoGridStyled,
	RowStyled,
	WrapStyled,
} from "./styled";

interface PreviewPhoto {
	tag: string;
	kind: PhotoKind;
	note: string;
	time: string;
}

const PHOTOS: PreviewPhoto[] = [
	{
		tag: "Engine bay",
		kind: "engine",
		note: "Engine bay is clean. No fluid leaks visible. Will check oil level next.",
		time: "2:38 PM",
	},
	{
		tag: "Dashboard",
		kind: "dash",
		note: "Dashboard powers on. No active warning lights. Mileage matches listing.",
		time: "2:24 PM",
	},
	{
		tag: "Driver side",
		kind: "car",
		note: "Front quarter panel — paint matches surrounding panels. No repair signs.",
		time: "2:14 PM",
	},
	{
		tag: "Tyre · front R",
		kind: "tire",
		note: "Tyre tread depth 6mm. Within wear limit. No bulges or cracks.",
		time: "2:17 PM",
	},
];

export default function LiveFeedPreview() {
	const [photoIdx, setPhotoIdx] = useState(3);

	useEffect(() => {
		const t = setInterval(() => {
			setPhotoIdx((p) => (p + 1) % PHOTOS.length);
		}, 2200);
		return () => clearInterval(t);
	}, []);

	const current = PHOTOS[photoIdx];

	return (
		<WrapStyled>
			<RowStyled>
				<RowStyled className="lead">
					<DotStyled />
					<Eyebrow $gold>Live · Inspection in progress</Eyebrow>
				</RowStyled>
				<MonoStyled>CHK-2026-0429</MonoStyled>
			</RowStyled>

			<PhotoGridStyled>
				{PHOTOS.map((p, i) => (
					<Photo
						key={p.tag}
						tag={p.tag}
						kind={p.kind}
						lit={i === photoIdx}
						ratio="4/3"
					/>
				))}
			</PhotoGridStyled>

			<NoteCardStyled>
				<RowStyled className="note-head">
					<Eyebrow>Inspector note · {current.time}</Eyebrow>
					<span className="author">Tunde B.</span>
				</RowStyled>
				<p className="note">{current.note}</p>
			</NoteCardStyled>

			<RowStyled className="footer">
				<Avatar name="TB" size={32} />
				<div className="who">
					<div className="name">Tunde Bakare</div>
					<div className="role">Currently examining · Engine</div>
				</div>
				<MonoStyled className="photos">23 photos</MonoStyled>
			</RowStyled>
		</WrapStyled>
	);
}
