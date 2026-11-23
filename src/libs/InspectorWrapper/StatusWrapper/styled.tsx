"use client";

import styled from "styled-components";
import { Card } from "@/components";

type Status = "pending" | "rejected" | "suspended";

export const PanelStyled = styled(Card)`
	padding: 48px;
	text-align: center;
	max-width: 560px;
	margin: 0 auto;
`;

export const IconWrapStyled = styled.div<{ $tone: Status }>`
	width: 80px;
	height: 80px;
	border-radius: 50%;
	background: ${(p) =>
		p.$tone === "pending"
			? "var(--gold-wash)"
			: p.$tone === "rejected"
				? "var(--danger-wash)"
				: "var(--caution-wash)"};
	border: 1px solid ${(p) =>
		p.$tone === "pending"
			? "var(--gold-wash-2)"
			: p.$tone === "rejected"
				? "var(--danger-deep)"
				: "var(--caution-deep)"};
	color: ${(p) =>
		p.$tone === "pending"
			? "var(--gold-bright)"
			: p.$tone === "rejected"
				? "var(--danger)"
				: "var(--caution)"};
	display: inline-flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 24px;
`;

export const TitleStyled = styled.h1`
	font-family: var(--display);
	font-weight: 400;
	font-size: 44px;
	margin: 12px 0;
	letter-spacing: -0.02em;

	em {
		font-style: italic;
		color: var(--gold-bright);
	}
`;

export const BodyStyled = styled.p`
	color: var(--ink-soft);
	font-size: 15px;
	line-height: 1.6;
	margin-bottom: 28px;
`;
