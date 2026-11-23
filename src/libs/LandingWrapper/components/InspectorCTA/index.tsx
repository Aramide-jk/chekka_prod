"use client";

import Link from "next/link";
import { Button } from "@/components";
import {
	Card2Styled,
	EyebrowStyled,
	GlowStyled,
	GridStyled,
	LedeStyled,
	SectionStyled,
	StatCardStyled,
	StatNumStyled,
	StatsColStyled,
	TitleStyled,
} from "./styled";

const STATS = [
	{ n: "₦42k", l: "Avg per inspection" },
	{ n: "8–14", l: "Jobs per week" },
	{ n: "48h", l: "Payout window" },
] as const;

export default function InspectorCTA() {
	return (
		<SectionStyled id="inspectors">
			<Card2Styled>
				<GlowStyled />
				<GridStyled>
					<div>
						<EyebrowStyled $gold>For Inspectors</EyebrowStyled>
						<TitleStyled>
							Get paid to do
							<br />
							what you already do well.
						</TitleStyled>
						<LedeStyled>
							Certified automotive technicians earn
							₦25,000–₦60,000 per inspection. Set your own
							schedule. Get paid in 48 hours.
						</LedeStyled>
						<Link href="/inspector/apply">
							<Button
								variant="primary"
								size="lg"
								iconRight="chevron-right"
							>
								Apply as inspector
							</Button>
						</Link>
					</div>
					<StatsColStyled>
						{STATS.map((s) => (
							<StatCardStyled key={s.l}>
								<span className="label">{s.l}</span>
								<StatNumStyled>{s.n}</StatNumStyled>
							</StatCardStyled>
						))}
					</StatsColStyled>
				</GridStyled>
			</Card2Styled>
		</SectionStyled>
	);
}
