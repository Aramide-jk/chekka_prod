"use client";

import Link from "next/link";
import { Button, Eyebrow, Icon } from "@/components";
import LiveFeedPreview from "../LiveFeedPreview";
import {
	BadgeStyled,
	ButtonsStyled,
	DotStyled,
	GridStyled,
	SectionStyled,
	SubStyled,
	TitleStyled,
	TrustItemStyled,
	TrustStyled,
} from "./styled";

export default function Hero() {
	return (
		<SectionStyled>
			<GridStyled>
				<div>
					<BadgeStyled>
						<DotStyled />
						<Eyebrow $gold className="eyebrow">
							Now serving Lagos · Abuja · Port Harcourt · Kano
						</Eyebrow>
					</BadgeStyled>
					<TitleStyled>
						Before you
						<br />
						<em>buy</em> the car,
						<br />
						we inspect it.
					</TitleStyled>
					<SubStyled>
						A certified Chekka inspector visits the car on your
						behalf, documents every detail in real time, and
						delivers a verdict — before you spend a single naira.
					</SubStyled>
					<ButtonsStyled>
						<Link href="/book">
							<Button
								variant="primary"
								size="lg"
								iconRight="chevron-right"
							>
								Book an inspection
							</Button>
						</Link>
						<Link href="/sample-report">
							<Button variant="secondary" size="lg">
								See a sample report
							</Button>
						</Link>
					</ButtonsStyled>
					<TrustStyled>
						<TrustItemStyled>
							<Icon name="shield-check" size={16} />
							<span>Certified inspectors</span>
						</TrustItemStyled>
						<TrustItemStyled>
							<Icon name="camera" size={16} />
							<span>Live photo feed</span>
						</TrustItemStyled>
						<TrustItemStyled>
							<Icon name="naira" size={16} />
							<span>Escrow payments</span>
						</TrustItemStyled>
					</TrustStyled>
				</div>

				<LiveFeedPreview />
			</GridStyled>
		</SectionStyled>
	);
}
