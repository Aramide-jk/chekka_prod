"use client";

import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/components";

export const StepperStyled = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 40px;
	overflow-x: auto;
	padding-bottom: 4px;
`;
export const StepPillStyled = styled.div<{ $on: boolean; $done: boolean }>`
	display: inline-flex;
	align-items: center;
	gap: 10px;
	padding: 8px 16px;
	border-radius: var(--r-pill);
	border: 1px solid ${(p) => (p.$done || p.$on ? "var(--gold-wash-2)" : "var(--hairline)")};
	background: ${(p) => (p.$on ? "var(--gold-wash)" : p.$done ? "var(--surface)" : "transparent")};
	color: ${(p) => (p.$on ? "var(--gold-bright)" : p.$done ? "var(--ink)" : "var(--ink-muted)")};
	font-size: 13px;
	white-space: nowrap;
`;
export const StepNumStyled = styled.span<{ $on: boolean; $done: boolean }>`
	font-family: var(--display);
	font-size: 14px;
	width: 22px;
	height: 22px;
	border-radius: 50%;
	background: ${(p) => (p.$on ? "var(--gold-bright)" : p.$done ? "var(--gold-deep)" : "var(--surface-3)")};
	color: ${(p) => (p.$on ? "#1A1813" : "var(--ink)")};
	display: inline-flex;
	align-items: center;
	justify-content: center;
`;
export const GridStyled = styled.div`
	display: grid;
	grid-template-columns: 2fr 1fr;
	gap: 24px;
	@media (max-width: 900px) { grid-template-columns: 1fr; }
	& > * { min-width: 0; }
`;
export const PanelStyled = styled(Card)`
	padding: 32px;
	@media (max-width: 640px) { padding: 22px 18px; }
`;
export const PanelTitleStyled = styled.h2`
	font-family: var(--display);
	font-size: 28px;
	margin: 0 0 6px;

	&.contact-title {
		font-size: 20px;
		margin: 28px 0 6px;
	}
`;
export const PanelLedeStyled = styled.p`
	color: var(--ink-soft);
	font-size: 14px;
	margin-bottom: 24px;

	&.contact-lede {
		margin-bottom: 16px;
	}
`;
export const FormGridStyled = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 16px;
	@media (max-width: 540px) { grid-template-columns: 1fr; }
`;
export const LabelStyled = styled.label`
	display: flex;
	flex-direction: column;
	gap: 6px;
	font-size: 12px;
	color: var(--ink-soft);
	input, select, textarea {
		padding: 12px 14px;
		background: var(--surface-2);
		border: 1px solid var(--hairline-strong);
		border-radius: var(--r-sm);
		color: var(--ink);
		font-family: var(--sans);
		font-size: 14px;
	}

	&.full-span {
		grid-column: 1 / -1;
	}

	&.date-label {
		max-width: 240px;
	}

	.required {
		color: var(--danger);
	}
`;
export const TypeGridStyled = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 16px;
	@media (max-width: 900px) { grid-template-columns: 1fr; }
`;
export const TypeCardStyled = styled.button<{ $selected: boolean }>`
	text-align: left;
	padding: 24px;
	border-radius: var(--r-md);
	background: ${(p) => (p.$selected ? "var(--surface-2)" : "var(--surface)")};
	border: 1px solid ${(p) => (p.$selected ? "var(--gold)" : "var(--hairline)")};
	color: var(--ink);
	cursor: pointer;
`;
export const UrgentCardStyled = styled.button<{ $on: boolean }>`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	width: 100%;
	margin-top: 16px;
	padding: 18px 22px;
	text-align: left;
	border-radius: var(--r-md);
	background: ${(p) => (p.$on ? "var(--gold-wash)" : "var(--surface)")};
	border: 1px solid ${(p) => (p.$on ? "var(--gold)" : "var(--hairline)")};
	color: var(--ink);
	cursor: pointer;

	.urgent-info {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.urgent-title {
		font-family: var(--display);
		font-size: 18px;
	}

	.urgent-sub {
		font-size: 12px;
		color: var(--ink-muted);
	}
`;
export const TypeNameStyled = styled.div`font-family: var(--display); font-size: 22px; margin-bottom: 6px;`;
export const TypePriceStyled = styled.div`font-family: var(--display); font-size: 28px; color: var(--gold-bright); margin-bottom: 14px;`;
export const TypeDescStyled = styled.p`color: var(--ink-muted); font-size: 12px; line-height: 1.55;`;
export const InspectorListStyled = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;

	.empty {
		color: var(--ink-muted);
		font-size: 13px;
		padding: 20px 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
		align-items: flex-start;
	}
`;
export const InspectorRowStyled = styled.div<{ $selected: boolean }>`
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 18px;
	background: var(--surface-2);
	border: 1px solid ${(p) => (p.$selected ? "var(--gold)" : "var(--hairline)")};
	border-radius: var(--r-md);

	.info {
		flex: 1;
	}

	.name {
		font-size: 15px;
		margin-bottom: 4px;
	}

	.meta {
		display: flex;
		gap: 14px;
		color: var(--ink-muted);
		font-size: 12px;
	}
`;
export const MugStyled = styled.div`
	width: 56px;
	height: 56px;
	border-radius: 50%;
	background: linear-gradient(135deg, var(--surface-3), var(--surface-2));
	border: 1px solid var(--hairline);
	flex-shrink: 0;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	color: var(--gold);
	font-family: var(--display);
	font-size: 18px;
`;
export const BrowseRowStyled = styled.div`
	margin-top: 16px;
`;
export const SlotGridStyled = styled.div`
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 10px;
	margin-top: 16px;
	@media (max-width: 540px) { grid-template-columns: repeat(2, 1fr); }
`;
export const SlotStyled = styled.button<{ $on: boolean; $taken?: boolean }>`
	padding: 12px;
	border-radius: var(--r-sm);
	background: ${(p) => (p.$on ? "var(--gold-wash)" : "var(--surface-2)")};
	border: 1px solid ${(p) => (p.$on ? "var(--gold)" : "var(--hairline)")};
	color: ${(p) => (p.$on ? "var(--gold-bright)" : "var(--ink-soft)")};
	cursor: pointer;
	font-size: 13px;
	${(p) =>
		p.$taken
			? "opacity: 0.4; cursor: not-allowed; text-decoration: line-through;"
			: ""}
`;
export const SummaryStyled = styled(Card)`
	padding: 24px;
	position: sticky;
	top: 96px;
	@media (max-width: 640px) { padding: 20px 18px; position: static; }

	.summary-label {
		color: var(--ink-muted);
		font-size: 11px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		margin-bottom: 14px;
	}

	.escrow {
		margin-top: 18px;
	}
`;
export const LineStyled = styled.div`
	display: flex;
	justify-content: space-between;
	padding: 10px 0;
	color: var(--ink-soft);
	font-size: 13px;
	border-bottom: 1px solid var(--hairline);
	&:last-of-type { border-bottom: none; }
`;
export const TotalStyled = styled.div`
	display: flex;
	justify-content: space-between;
	padding-top: 14px;
	margin-top: 8px;
	border-top: 1px solid var(--hairline-strong);
	font-family: var(--display);
	font-size: 22px;
`;
export const StepActionsStyled = styled.div`
	display: flex;
	justify-content: space-between;
	margin-top: 24px;
	gap: 12px;
`;
export const ErrorBoxStyled = styled.div`
	margin-top: 14px;
	padding: 10px 14px;
	background: var(--danger-wash);
	border: 1px solid var(--danger-deep);
	border-radius: var(--r-sm);
	color: var(--danger);
	font-size: 13px;
`;
export const ConfirmListStyled = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
	color: var(--ink-soft);
	font-size: 14px;
`;
