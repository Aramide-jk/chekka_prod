"use client";

import { Eyebrow, Icon, type IconName } from "@/components";
import SampleReportCard from "../SampleReportCard";
import {
	EyebrowStyled,
	IconBoxStyled,
	InnerStyled,
	LedeStyled,
	PillarRowStyled,
	PillarsStyled,
	SectionStyled,
	TitleStyled,
} from "./styled";

interface Pillar {
	i: IconName;
	t: string;
	d: string;
}

const PILLARS: Pillar[] = [
	{
		i: "shield-check",
		t: "Independent inspectors",
		d: "Inspectors don't work for sellers or dealerships. Their incentive is one thing: accuracy.",
	},
	{
		i: "camera",
		t: "Photographic proof",
		d: "Every claim in your report is backed by timestamped photos uploaded live from the field.",
	},
	{
		i: "naira",
		t: "Escrow-protected payment",
		d: "Money sits in escrow for 48 hours. Dispute it and we hold longer. Never lose a kobo to a bad inspection.",
	},
];

export default function Trust() {
	return (
		<SectionStyled id="trust">
			<InnerStyled>
				<div>
					<EyebrowStyled $gold>
						Why people trust Chekka
					</EyebrowStyled>
					<TitleStyled>
						Your money is <em>safe</em>
						<br />
						until the job is done.
					</TitleStyled>
					<LedeStyled>
						Buyers pay Chekka, not the inspector. We hold the funds
						in escrow for 48 hours after the report lands — and
						release them only when you have no complaints.
					</LedeStyled>
					<PillarsStyled>
						{PILLARS.map((p) => (
							<PillarRowStyled key={p.t}>
								<IconBoxStyled>
									<Icon name={p.i} size={20} />
								</IconBoxStyled>
								<div>
									<div className="title">{p.t}</div>
									<p className="desc">{p.d}</p>
								</div>
							</PillarRowStyled>
						))}
					</PillarsStyled>
				</div>

				<SampleReportCard />
			</InnerStyled>
		</SectionStyled>
	);
}
