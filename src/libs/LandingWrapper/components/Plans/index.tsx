"use client";

import Link from "next/link";
import { Button, Eyebrow, Icon, Pill } from "@/components";
import {
	CardStyled,
	DescStyled,
	FeatureStyled,
	FeaturesStyled,
	GridStyled,
	HeadingStyled,
	NameStyled,
	PopularTagStyled,
	PriceStyled,
	SectionStyled,
	TitleStyled,
} from "./styled";

interface Plan {
	name: string;
	price: string;
	desc: string;
	features: string[];
	tone: "primary" | "secondary";
	popular?: boolean;
	href: string;
	cta: string;
}

const PLANS: Plan[] = [
	{
		name: "Standard",
		price: "₦32,000",
		desc: "Complete inspection. Every panel, every system. Fixed price. 48-hour turnaround.",
		features: [
			"50+ checkpoints",
			"30+ live photos",
			"Full structured report",
			"Verdict + remediation list",
		],
		tone: "secondary",
		href: "/book?type=standard",
		cta: "Choose Standard",
	},
	{
		name: "Premium",
		price: "₦52,000",
		desc: "Priority pool. Top-rated inspectors only. 24-hour turnaround.",
		features: [
			"Everything in Standard",
			"Top-tier inspectors",
			"OBD2 diagnostic scan",
			"Road test video clips",
			"Priority report delivery",
		],
		tone: "primary",
		popular: true,
		href: "/book?type=premium",
		cta: "Choose Premium",
	},
	{
		name: "Special Request",
		price: "Custom",
		desc: "Salvage cars, classics, fleet purchases. We tailor the inspection to your situation.",
		features: [
			"Consultant-led intake",
			"Custom checklist",
			"Specialist inspectors",
			"Direct admin oversight",
		],
		tone: "secondary",
		href: "/chat?context=special-request",
		cta: "Talk to a consultant",
	},
];

export default function Plans() {
	return (
		<SectionStyled id="plans">
			<HeadingStyled>
				<Eyebrow $gold className="eyebrow">
					Inspection Plans
				</Eyebrow>
				<TitleStyled>
					Pick the plan, <em>pick the inspector.</em>
				</TitleStyled>
			</HeadingStyled>

			<GridStyled>
				{PLANS.map((p) => (
					<CardStyled key={p.name} $popular={p.popular}>
						{p.popular && (
							<PopularTagStyled>
								<Pill tone="gold">Most chosen</Pill>
							</PopularTagStyled>
						)}
						<NameStyled $popular={p.popular}>{p.name}</NameStyled>
						<PriceStyled>{p.price}</PriceStyled>
						<DescStyled>{p.desc}</DescStyled>
						<FeaturesStyled>
							{p.features.map((f) => (
								<FeatureStyled key={f}>
									<Icon name="check" size={14} />
									<span>{f}</span>
								</FeatureStyled>
							))}
						</FeaturesStyled>
						<Link href={p.href} className="cta-link">
							<Button variant={p.tone} size="lg" fullWidth>
								{p.cta}
							</Button>
						</Link>
					</CardStyled>
				))}
			</GridStyled>
		</SectionStyled>
	);
}
