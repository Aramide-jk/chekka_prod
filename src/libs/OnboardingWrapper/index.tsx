"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Eyebrow, Icon, type IconName, Logo } from "@/components";
import {
	ActionsStyled,
	BodyStyled,
	BottomStyled,
	CanvasStyled,
	DotStyled,
	DotsStyled,
	IconWrapStyled,
	LedeStyled,
	SlideStyled,
	StepCountStyled,
	TitleStyled,
	TopStyled,
} from "./styled";

interface Slide {
	icon: IconName;
	eyebrow: string;
	title: string;
	titleEm: string;
	body: string;
}

const SLIDES: Slide[] = [
	{
		icon: "shield-check",
		eyebrow: "Step 1 · Certified",
		title: "A certified inspector",
		titleEm: "on your behalf",
		body: "We send a vetted independent professional to physically examine the car. They photograph every panel, every system. They work for you — not the seller.",
	},
	{
		icon: "camera",
		eyebrow: "Step 2 · Real-time",
		title: "Watch it happen",
		titleEm: "live",
		body: "From the moment they arrive, every photo and finding streams to your screen in real time. You see the car as if you were standing right there.",
	},
	{
		icon: "naira",
		eyebrow: "Step 3 · Verdict",
		title: "Decide with",
		titleEm: "confidence",
		body: "Within 48 hours of the visit you receive a structured report: every checkpoint, every photo, a final verdict, and a remediation list — so you can decide before you spend a kobo.",
	},
];

export default function OnboardingWrapper() {
	const [i, setI] = useState(0);
	const slide = SLIDES[i];
	const isLast = i === SLIDES.length - 1;

	return (
		<CanvasStyled>
			<TopStyled>
				<Logo />
				<StepCountStyled>
					{i + 1} of {SLIDES.length}
				</StepCountStyled>
			</TopStyled>
			<BodyStyled>
				<SlideStyled key={i} data-testid={`onboarding-slide-${i}`}>
					<IconWrapStyled>
						<Icon name={slide.icon} size={32} />
					</IconWrapStyled>
					<Eyebrow $gold>{slide.eyebrow}</Eyebrow>
					<TitleStyled>
						{slide.title} <em>{slide.titleEm}</em>
					</TitleStyled>
					<LedeStyled>{slide.body}</LedeStyled>
				</SlideStyled>
			</BodyStyled>
			<BottomStyled>
				<DotsStyled>
					{SLIDES.map((s, idx) => (
						<DotStyled key={s.eyebrow} $on={idx <= i} />
					))}
				</DotsStyled>
				<ActionsStyled>
					<Button
						variant="ghost"
						size="md"
						onClick={() => setI(Math.max(0, i - 1))}
						disabled={i === 0}
					>
						Back
					</Button>
					{isLast ? (
						<Link href="/signup">
							<Button
								variant="primary"
								size="md"
								iconRight="chevron-right"
							>
								Create your account
							</Button>
						</Link>
					) : (
						<Button
							variant="primary"
							size="md"
							iconRight="chevron-right"
							onClick={() => setI(i + 1)}
						>
							Continue
						</Button>
					)}
				</ActionsStyled>
			</BottomStyled>
		</CanvasStyled>
	);
}
