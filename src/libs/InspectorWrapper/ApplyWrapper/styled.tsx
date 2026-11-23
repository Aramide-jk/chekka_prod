"use client";

import styled from "styled-components";
import { Card } from "@/components";

export const StepperStyled = styled.div`display: flex; gap: 10px; margin-bottom: 32px;`;

export const StepPillStyled = styled.div<{ $on: boolean; $done: boolean }>`
	padding: 8px 14px;
	border-radius: var(--r-pill);
	background: ${(p) => (p.$on ? "var(--gold-wash)" : p.$done ? "var(--surface-2)" : "transparent")};
	border: 1px solid ${(p) => (p.$on || p.$done ? "var(--gold-wash-2)" : "var(--hairline)")};
	color: ${(p) => (p.$on ? "var(--gold-bright)" : p.$done ? "var(--ink)" : "var(--ink-muted)")};
	font-size: 13px;
`;

export const PanelStyled = styled(Card)`padding: 32px; max-width: 720px;`;

export const PanelTitleStyled = styled.h2`font-family: var(--display); font-size: 26px; margin: 0 0 6px;`;

export const LedeStyled = styled.p`color: var(--ink-soft); font-size: 14px; margin-bottom: 24px;`;

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

	&.span-all { grid-column: 1 / -1; }
`;

export const SpecChipsStyled = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
`;

export const SpecChipStyled = styled.button<{ $on: boolean }>`
	padding: 8px 14px;
	border-radius: var(--r-pill);
	background: ${(p) => (p.$on ? "var(--gold-wash)" : "transparent")};
	border: 1px solid ${(p) => (p.$on ? "var(--gold-wash-2)" : "var(--hairline-strong)")};
	color: ${(p) => (p.$on ? "var(--gold-bright)" : "var(--ink-soft)")};
	font-size: 13px;
	cursor: pointer;
	transition: all 0.12s ease;
	&:hover { border-color: var(--gold); }
`;

export const DropStyled = styled.label`
	display: block;
	padding: 28px;
	text-align: center;
	border-radius: var(--r-md);
	border: 1px dashed var(--hairline-strong);
	color: var(--ink-muted);
	background: var(--surface-2);
	cursor: pointer;
	input { display: none; }

	.drop-label { margin-top: 8px; font-size: 13px; }
`;

export const DocsStyled = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

export const StepCountStyled = styled.div`
	font-size: 12px;
	color: var(--gold-bright);
	letter-spacing: 0.06em;
	text-transform: uppercase;
	margin-bottom: 10px;
`;

export const IntroListStyled = styled.ul`
	list-style: none;
	margin: 0 0 24px;
	padding: 0;
	display: flex;
	flex-direction: column;
	gap: 10px;

	li {
		display: flex;
		gap: 10px;
		align-items: flex-start;
		font-size: 13px;
		color: var(--ink-soft);
	}

	.intro-num {
		flex-shrink: 0;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		background: var(--gold-wash);
		border: 1px solid var(--gold-wash-2);
		color: var(--gold-bright);
	}
`;

export const PhotoRowStyled = styled.div`
	display: flex;
	align-items: center;
	gap: 16px;
	margin-bottom: 8px;
`;

export const PhotoPreviewStyled = styled.span`
	width: 72px;
	height: 72px;
	border-radius: 50%;
	overflow: hidden;
	flex-shrink: 0;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	background: var(--surface-2);
	border: 1px solid var(--hairline-strong);
	color: var(--ink-muted);
	font-size: 22px;

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
`;

export const SuccessPanelStyled = styled(Card)`
	padding: 40px 32px;
	max-width: 560px;
	text-align: center;

	.success-icon {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: var(--gold-wash);
		border: 1px solid var(--gold-wash-2);
		color: var(--gold-bright);
		margin-bottom: 18px;
	}

	h2 {
		font-family: var(--display);
		font-size: 28px;
		margin: 0 0 10px;
	}

	p {
		color: var(--ink-soft);
		font-size: 14px;
		margin: 0 auto 26px;
		max-width: 420px;
		line-height: 1.5;
	}

	.success-actions {
		display: flex;
		gap: 12px;
		justify-content: center;
		flex-wrap: wrap;
	}
`;

export const ActionsStyled = styled.div`
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
