"use client";

import styled from "styled-components";
import { Card } from "@/components";

export const PanelStyled = styled(Card)`
	padding: 28px;
	max-width: 720px;
	margin-bottom: 20px;
`;

export const PanelTitleStyled = styled.h2`
	font-family: var(--display);
	font-size: 22px;
	margin: 0 0 18px;
`;

export const AvatarRowStyled = styled.div`
	display: flex;
	align-items: center;
	gap: 18px;

	.avatar-actions {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
`;

export const FormGridStyled = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 16px;
	@media (max-width: 540px) {
		grid-template-columns: 1fr;
	}
`;

export const FieldStyled = styled.label`
	display: flex;
	flex-direction: column;
	gap: 6px;
	font-size: 12px;
	color: var(--ink-soft);

	.field-label {
		font-size: 12px;
		color: var(--ink-soft);
	}

	input,
	textarea {
		padding: 12px 14px;
		background: var(--surface-2);
		border: 1px solid var(--hairline-strong);
		border-radius: var(--r-sm);
		color: var(--ink);
		font-family: var(--sans);
		font-size: 14px;
	}

	input:disabled {
		color: var(--ink-muted);
		cursor: not-allowed;
	}

	&.span-all {
		grid-column: 1 / -1;
	}
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
	border: 1px solid
		${(p) => (p.$on ? "var(--gold-wash-2)" : "var(--hairline-strong)")};
	color: ${(p) => (p.$on ? "var(--gold-bright)" : "var(--ink-soft)")};
	font-size: 13px;
	cursor: pointer;
	transition: all 0.12s ease;
	&:hover {
		border-color: var(--gold);
	}
`;

export const SaveRowStyled = styled.div`
	display: flex;
	align-items: center;
	gap: 14px;
	margin-top: 22px;
`;

export const NoteStyled = styled.div`
	display: inline-flex;
	align-items: center;
	gap: 6px;
	color: var(--ink-muted);
	font-size: 12px;
`;

export const StatusStyled = styled.span<{ $err?: boolean }>`
	font-size: 13px;
	color: ${(p) => (p.$err ? "var(--danger)" : "var(--gold-bright)")};
`;
