"use client";

import { useState } from "react";
import { Eyebrow } from "@/components";
import {
	CellStyled,
	DescStyled,
	GridStyled,
	HeadingStyled,
	LedeStyled,
	NumStyled,
	SectionStyled,
	StepTitleStyled,
	SwitchButtonStyled,
	SwitchStyled,
	TitleStyled,
} from "./styled";

const BUYER_STEPS = [
	{
		n: "01",
		t: "Find a car",
		d: "You spot a car you like — at a dealership or private seller. Anywhere in Nigeria.",
	},
	{
		n: "02",
		t: "Book a Chekka",
		d: "Choose a plan, pick a certified inspector, and schedule the visit. Pay securely via Paystack.",
	},
	{
		n: "03",
		t: "Watch live",
		d: "While the inspector is at the car, every photo and finding streams to your screen in real time.",
	},
	{
		n: "04",
		t: "Read the verdict",
		d: "Within 48 hours, you get a structured report with a clear: Worth Buying · With Caution · Not Recommended.",
	},
	{
		n: "05",
		t: "Or hand it to us",
		d: "Want to take it further? A Chekka broker can negotiate, pay, and arrange delivery on your behalf.",
	},
] as const;

const BROKER_STEPS = [
	{
		n: "01",
		t: "Buyer shares the report",
		d: "Once a buyer reads their verdict, they can hand the deal to a Chekka broker with their budget and delivery address.",
	},
	{
		n: "02",
		t: "We negotiate",
		d: "Your broker contacts the seller and negotiates hard on price — you never have to meet the seller or haggle yourself.",
	},
	{
		n: "03",
		t: "Secure payment",
		d: "Payment is held in escrow and only released once everything checks out. No cash changes hands directly.",
	},
	{
		n: "04",
		t: "Delivery arranged",
		d: "The broker coordinates logistics and delivers the car to the buyer's door — paperwork handled end to end.",
	},
	{
		n: "05",
		t: "You stay in the loop",
		d: "Every step happens in your chat with the broker, so you always know exactly where the deal stands.",
	},
] as const;

const INSPECTOR_STEPS = [
	{
		n: "01",
		t: "Apply & get verified",
		d: "Sign up, upload your ID for identity verification (and a certificate to become Certified), and we review within 48 hours.",
	},
	{
		n: "02",
		t: "Accept nearby jobs",
		d: "Browse inspection requests from buyers in your city and accept the ones that fit your schedule.",
	},
	{
		n: "03",
		t: "Inspect & stream live",
		d: "Visit the car, photograph every section, and stream each capture to the buyer in real time.",
	},
	{
		n: "04",
		t: "File the report",
		d: "Complete the structured checklist and vehicle details, then submit a clear verdict for the buyer.",
	},
	{
		n: "05",
		t: "Get paid",
		d: "Your payout is released after the report is filed — typically within 48 hours.",
	},
] as const;

const AUDIENCES = [
	{ k: "buyer" as const, label: "For Buyers", steps: BUYER_STEPS },
	{
		k: "inspector" as const,
		label: "For Inspectors",
		steps: INSPECTOR_STEPS,
	},
	{ k: "broker" as const, label: "With Broker", steps: BROKER_STEPS },
];

export default function HowItWorks() {
	const [audience, setAudience] = useState<"buyer" | "inspector" | "broker">(
		"buyer",
	);
	const active = AUDIENCES.find((a) => a.k === audience) ?? AUDIENCES[0];

	const lede =
		audience === "buyer"
			? "From the moment you find a car you like to the moment you decide whether to buy — we hold your hand."
			: audience === "inspector"
				? "Get verified, accept jobs from buyers near you, inspect cars, and get paid — all on your schedule."
				: "Hand the deal to a Chekka broker and we take it from inspection all the way to your door.";

	return (
		<SectionStyled id="how">
			<HeadingStyled>
				<Eyebrow $gold className="eyebrow">
					The Chekka Process
				</Eyebrow>
				<TitleStyled>
					Five steps. <em>Zero risk.</em>
				</TitleStyled>
				<LedeStyled>{lede}</LedeStyled>
				<SwitchStyled role="tablist" aria-label="How it works audience">
					{AUDIENCES.map((a) => (
						<SwitchButtonStyled
							key={a.k}
							type="button"
							role="tab"
							aria-selected={audience === a.k}
							$on={audience === a.k}
							onClick={() => setAudience(a.k)}
						>
							{a.label}
						</SwitchButtonStyled>
					))}
				</SwitchStyled>
			</HeadingStyled>

			<GridStyled>
				{active.steps.map((s) => (
					<CellStyled key={s.n}>
						<NumStyled>{s.n}</NumStyled>
						<StepTitleStyled>{s.t}</StepTitleStyled>
						<DescStyled>{s.d}</DescStyled>
					</CellStyled>
				))}
			</GridStyled>
		</SectionStyled>
	);
}
