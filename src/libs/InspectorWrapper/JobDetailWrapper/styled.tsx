"use client";

import styled from "styled-components";
import { Card } from "@/components";

export const GridStyled = styled.div`
	display: grid;
	grid-template-columns: 2fr 1fr;
	gap: 24px;
	@media (max-width: 900px) { grid-template-columns: 1fr; }
`;

export const LeftColStyled = styled.div`
	display: flex;
	flex-direction: column;
	gap: 24px;
`;

export const RightColStyled = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

export const SectionStyled = styled(Card)`
	padding: 24px;

	.eyebrow-14 { margin-bottom: 14px; }
	.eyebrow-12 { margin-bottom: 12px; }

	.seller-pending {
		font-size: 14px;
		margin-bottom: 12px;
		color: var(--ink-muted);
	}
	.seller-contact { font-size: 14px; margin-bottom: 4px; }
	.seller-sub {
		font-size: 12px;
		color: var(--ink-muted);
		margin-bottom: 12px;
	}
	.seller-none {
		font-size: 14px;
		margin-bottom: 12px;
		color: var(--ink-muted);
	}
	.seller-actions {
		display: flex;
		gap: 12px;
		align-items: center;
		flex-wrap: wrap;
	}

	.buyer-name { font-size: 14px; margin-bottom: 4px; }
	.buyer-phone {
		font-size: 13px;
		color: var(--ink-soft);
		margin-bottom: 12px;
	}

	.schedule-line { font-size: 14px; margin-bottom: 6px; }

	.payout-value {
		font-family: var(--display);
		font-size: 28px;
		color: var(--gold-bright);
	}
	.payout-pill { margin-top: 10px; }
`;

export const SpecStyled = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 0 32px;
	@media (max-width: 540px) { grid-template-columns: 1fr; }
`;

export const SpecRowStyled = styled.div`
	display: flex;
	justify-content: space-between;
	padding: 12px 0;
	border-bottom: 1px solid var(--hairline);
	font-size: 13px;
	span:first-child { color: var(--ink-muted); }
`;

export const CountdownStyled = styled.div`
	padding: 18px 22px;
	border-radius: var(--r-md);
	background: var(--caution-wash);
	border: 1px solid var(--caution-deep);
	color: var(--caution);
	margin-bottom: 16px;

	.countdown-eyebrow { color: var(--caution); }
	.countdown-value {
		font-family: var(--display);
		font-size: 32px;
		margin-top: 6px;
	}
`;

export const AcceptedStyled = styled.div`
	padding: 18px 22px;
	border-radius: var(--r-md);
	background: var(--good-wash);
	border: 1px solid var(--good-deep);
	color: var(--good);
	margin-bottom: 16px;

	.accepted-eyebrow { color: var(--good); }
	.accepted-sub {
		font-size: 13px;
		margin-top: 6px;
		color: var(--ink-soft);
	}
`;

export const ActionsStyled = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;

	.unlock-hint {
		font-size: 12px;
		color: var(--ink-muted);
		text-align: center;
	}
`;
