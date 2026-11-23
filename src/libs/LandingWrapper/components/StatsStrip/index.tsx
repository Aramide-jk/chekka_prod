"use client";

import {
	EyebrowStyled,
	InnerStyled,
	SectionStyled,
	StatNumberStyled,
} from "./styled";

const STATS = [
	{ n: "12,400+", l: "Inspections completed" },
	{ n: "₦18B+", l: "In purchase decisions" },
	{ n: "97%", l: "Buyer satisfaction" },
	{ n: "48h", l: "Standard turnaround" },
] as const;

export default function StatsStrip() {
	return (
		<SectionStyled>
			<InnerStyled>
				{STATS.map((s) => (
					<div key={s.l}>
						<StatNumberStyled>{s.n}</StatNumberStyled>
						<EyebrowStyled>{s.l}</EyebrowStyled>
					</div>
				))}
			</InnerStyled>
		</SectionStyled>
	);
}
