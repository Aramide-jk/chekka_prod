"use client";

import styled from "styled-components";
import { Card } from "@/components";

export const GridStyled = styled.div`
	display: grid;
	grid-template-columns: 2fr 1fr;
	gap: 24px;
	@media (max-width: 900px) { grid-template-columns: 1fr; }
`;
export const SectionStyled = styled(Card)`
	padding: 24px;

	.section-eyebrow { margin-bottom: 16px; }
	.blocked-eyebrow { margin-bottom: 14px; }
	.blocked-copy { color: var(--ink-muted); font-size: 13px; }
	.blocked-action { margin-top: 14px; }
`;
export const DayGridStyled = styled.div`
	display: grid;
	grid-template-columns: 100px repeat(4, 1fr);
	gap: 8px;
	align-items: center;
`;
export const SlotBtnStyled = styled.button<{ $on: boolean }>`
	padding: 12px;
	border-radius: var(--r-sm);
	background: ${(p) => (p.$on ? "var(--gold-wash)" : "var(--surface-2)")};
	border: 1px solid ${(p) => (p.$on ? "var(--gold)" : "var(--hairline)")};
	color: ${(p) => (p.$on ? "var(--gold-bright)" : "var(--ink-soft)")};
	cursor: pointer;
	font-size: 13px;
`;
export const DayLabelStyled = styled.div`
	color: var(--ink-soft);
	font-size: 13px;

	&.slot-head { text-align: center; }
`;
export const SavedStyled = styled.div`
	margin-top: 14px;
	color: var(--good);
	font-size: 13px;
`;
export const ErrorBoxStyled = styled.div`
	margin-top: 14px;
	padding: 8px 12px;
	background: var(--danger-wash);
	border: 1px solid var(--danger-deep);
	border-radius: var(--r-sm);
	color: var(--danger);
	font-size: 13px;
`;
