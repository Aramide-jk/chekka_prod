"use client";

import styled from "styled-components";
import { Card } from "@/components";

export const StatsRowStyled = styled.div`
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 16px;
	margin-bottom: 24px;
	@media (max-width: 720px) { grid-template-columns: repeat(2, 1fr); }
`;

export const StatStyled = styled(Card)`padding: 22px;`;

export const StatLabelStyled = styled.div`
	color: var(--ink-muted);
	font-size: 11px;
	letter-spacing: 0.16em;
	text-transform: uppercase;
	margin-bottom: 12px;
`;

export const StatValueStyled = styled.div`font-family: var(--display); font-size: 32px; line-height: 1;`;

export const ToggleCardStyled = styled(Card)`
	padding: 18px 22px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24px;

	.eyebrow { margin-bottom: 6px; }
	.availability-sub { font-size: 14px; color: var(--ink-soft); }
`;

export const ToggleStyled = styled.button<{ $on: boolean }>`
	width: 56px;
	height: 32px;
	border-radius: 999px;
	background: ${(p) => (p.$on ? "var(--gold)" : "var(--surface-3)")};
	position: relative;
	border: none;
	cursor: pointer;
	transition: background 0.2s ease;
	&::after {
		content: "";
		position: absolute;
		top: 4px;
		left: ${(p) => (p.$on ? "28px" : "4px")};
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: ${(p) => (p.$on ? "#1A1813" : "var(--ink-soft)")};
		transition: left 0.2s ease;
	}
`;

export const GridStyled = styled.div`
	display: grid;
	grid-template-columns: 2fr 1fr;
	gap: 24px;
	@media (max-width: 900px) { grid-template-columns: 1fr; }
	& > * { min-width: 0; }
`;

export const SectionStyled = styled(Card)`
	padding: 24px;
	@media (max-width: 640px) { padding: 20px 18px; }

	.eyebrow-queue { margin-bottom: 16px; }
	.eyebrow-card { margin-bottom: 14px; }

	.earnings-label { font-size: 12px; color: var(--ink-muted); }
	.earnings-label-held { font-size: 12px; color: var(--ink-muted); margin-top: 10px; }
	.earnings-released { font-family: var(--display); font-size: 28px; color: var(--gold-bright); }
	.earnings-held { font-family: var(--display); font-size: 22px; }
`;

export const RowStyled = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 14px 0;
	gap: 12px;
	border-bottom: 1px solid var(--hairline);
	&:last-child { border-bottom: none; }

	@media (max-width: 560px) {
		flex-direction: column;
		align-items: stretch;
		gap: 10px;
	}
`;

export const RowMainStyled = styled.div`
	display: flex;
	gap: 12px;
	align-items: center;
	min-width: 0;
`;

export const RowTextStyled = styled.div`
	min-width: 0;
	& > div:first-child {
		font-size: 14px;
		margin-bottom: 4px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	& > div:last-child {
		font-size: 12px;
		color: var(--ink-muted);
	}
`;

export const RowSideStyled = styled.div`
	display: flex;
	align-items: center;
	gap: 14px;
	flex-shrink: 0;

	@media (max-width: 560px) {
		padding-left: 32px;
		flex-wrap: wrap;
		gap: 10px;
	}

	.payout { color: var(--gold-bright); }
`;

export const EmptyStyled = styled.div`
	color: var(--ink-muted);
	font-size: 13px;
	padding: 18px 0;
	text-align: center;
`;

export const SideColStyled = styled.div`
	display: flex;
	flex-direction: column;
	gap: 24px;
`;

export const QuickLinksStyled = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
`;
