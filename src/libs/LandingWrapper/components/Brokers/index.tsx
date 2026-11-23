"use client";

import Link from "next/link";
import { Avatar, Button, Pill } from "@/components";
import {
	BubbleStyled,
	ChatCardStyled,
	EyebrowStyled,
	GridStyled,
	HeaderStyled,
	LedeStyled,
	MessagesStyled,
	SectionStyled,
	TitleStyled,
} from "./styled";

interface ChatLine {
	from: "broker" | "buyer";
	text: string;
}

const CHAT: ChatLine[] = [
	{
		from: "broker",
		text: "I read the inspection report on your Camry. Suspension flag is real, but easy fix.",
	},
	{
		from: "broker",
		text: "I just spoke to the dealer. Got the price down ₦680,000. Want me to lock it?",
	},
	{
		from: "buyer",
		text: "Yes please.",
	},
	{
		from: "broker",
		text: "Done. I'll coordinate payment and arrange delivery to Lekki by Saturday.",
	},
];

export default function Brokers() {
	return (
		<SectionStyled id="brokers">
			<GridStyled>
				<ChatCardStyled>
					<HeaderStyled>
						<Avatar name="BA" size={48} />
						<div>
							<div className="name">Bayo Adekunle</div>
							<div className="meta">
								Chekka Broker · 142 deals · 4.9★
							</div>
						</div>
						<Pill tone="good" dot className="live">
							Live
						</Pill>
					</HeaderStyled>
					<MessagesStyled>
						{CHAT.map((m, i) => (
							<BubbleStyled key={i} $from={m.from}>
								{m.text}
							</BubbleStyled>
						))}
					</MessagesStyled>
				</ChatCardStyled>

				<div>
					<EyebrowStyled $gold>Chekka Broker Service</EyebrowStyled>
					<TitleStyled>
						You read the report.
						<br />
						<em>We do the rest.</em>
					</TitleStyled>
					<LedeStyled>
						A Chekka broker takes the report and runs with it —
						negotiates the price, coordinates secure payment,
						arranges delivery. You don't have to meet the seller,
						travel to the car, or handle a single kobo directly.
					</LedeStyled>
					<Link href="/chat?context=broker">
						<Button
							variant="primary"
							size="lg"
							iconRight="chevron-right"
						>
							Get a broker
						</Button>
					</Link>
				</div>
			</GridStyled>
		</SectionStyled>
	);
}
