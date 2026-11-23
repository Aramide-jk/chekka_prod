"use client";

import {
	Brokers,
	Footer,
	Header,
	Hero,
	HowItWorks,
	InspectorCTA,
	Plans,
	StatsStrip,
	Trust,
} from "./components";
import { CanvasStyled } from "./styled";

export default function LandingWrapper() {
	return (
		<CanvasStyled>
			<Header />
			<Hero />
			<StatsStrip />
			<HowItWorks />
			<Plans />
			<Trust />
			<Brokers />
			<InspectorCTA />
			<Footer />
		</CanvasStyled>
	);
}
