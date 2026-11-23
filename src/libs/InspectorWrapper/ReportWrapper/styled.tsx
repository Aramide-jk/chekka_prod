"use client";

import styled from "styled-components";
import { Card } from "@/components";

type Status = "good" | "minor" | "serious" | "n/a";

export const TabsStyled = styled.div`
	display: flex;
	gap: 6px;
	margin-bottom: 24px;
	border-bottom: 1px solid var(--hairline);
	overflow-x: auto;
	scrollbar-width: none;
	&::-webkit-scrollbar { display: none; }
`;
export const TabStyled = styled.button<{ $on: boolean }>`
	padding: 12px 16px;
	background: transparent;
	color: ${(p) => (p.$on ? "var(--gold-bright)" : "var(--ink-muted)")};
	border: none;
	border-bottom: 2px solid ${(p) => (p.$on ? "var(--gold)" : "transparent")};
	font-size: 13px;
	cursor: pointer;
	white-space: nowrap;
	flex-shrink: 0;
`;
export const SectionStyled = styled(Card)`
	padding: 24px;
	@media (max-width: 640px) { padding: 20px 16px; }

	.eyebrow-spaced { margin-bottom: 14px; }
	.verdict-pills { display: flex; gap: 10px; flex-wrap: wrap; }
	.summary-label { margin-top: 18px; display: block; }
	.summary-label-text {
		color: var(--ink-soft);
		font-size: 12px;
		display: block;
		margin-bottom: 6px;
	}
	.submit-row { margin-top: 18px; }
`;
export const ItemRowStyled = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	padding: 12px 0;
	border-bottom: 1px solid var(--hairline);
	&:last-child { border-bottom: none; }

	&.bare { border: none; padding: 0; }
	.item-label { font-size: 14px; }
`;
export const ItemWrapStyled = styled.div`
	padding: 12px 0;
	border-bottom: 1px solid var(--hairline);
	&:last-child { border-bottom: none; }
`;
export const CommentInputStyled = styled.textarea`
	margin-top: 10px;
	width: 100%;
	padding: 10px 12px;
	background: var(--surface-2);
	border: 1px solid var(--hairline-strong);
	border-radius: var(--r-sm);
	color: var(--ink);
	font-family: var(--sans);
	font-size: 13px;
	resize: vertical;
`;
export const SummaryInputStyled = styled.textarea`
	width: 100%;
	padding: 12px 14px;
	background: var(--surface-2);
	border: 1px solid var(--hairline-strong);
	border-radius: var(--r-sm);
	color: var(--ink);
	font-family: var(--sans);
	font-size: 14px;
`;
export const VehicleGridStyled = styled.div`
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 14px 18px;
	@media (max-width: 560px) { grid-template-columns: 1fr; }
`;
export const VehicleFieldStyled = styled.label`
	display: block;
	.vf-label {
		display: block;
		color: var(--ink-soft);
		font-size: 12px;
		margin-bottom: 6px;
	}
	input {
		width: 100%;
		padding: 10px 12px;
		background: var(--surface-2);
		border: 1px solid var(--hairline-strong);
		border-radius: var(--r-sm);
		color: var(--ink);
		font-family: var(--sans);
		font-size: 14px;
	}
`;
export const VerdictButtonStyled = styled.button`
	background: transparent;
	border: none;
	color: inherit;
	cursor: pointer;
	font-family: inherit;
	font-size: inherit;
	letter-spacing: inherit;
	text-transform: inherit;
	padding: 0;
`;
export const StatusBtnsStyled = styled.div`display: flex; gap: 6px;`;
export const StatusBtnStyled = styled.button<{ $on: boolean; $status: Status }>`
	padding: 6px 12px;
	border-radius: var(--r-pill);
	background: ${(p) =>
		p.$on
			? p.$status === "good"
				? "var(--good-wash)"
				: p.$status === "minor"
					? "var(--caution-wash)"
					: p.$status === "serious"
						? "var(--danger-wash)"
						: "var(--surface-2)"
			: "transparent"};
	border: 1px solid ${(p) =>
		p.$on
			? p.$status === "good"
				? "var(--good-deep)"
				: p.$status === "minor"
					? "var(--caution-deep)"
					: p.$status === "serious"
						? "var(--danger-deep)"
						: "var(--hairline-strong)"
			: "var(--hairline)"};
	color: ${(p) =>
		p.$on
			? p.$status === "good"
				? "var(--good)"
				: p.$status === "minor"
					? "var(--caution)"
					: p.$status === "serious"
						? "var(--danger)"
						: "var(--ink-soft)"
			: "var(--ink-muted)"};
	font-size: 11px;
	cursor: pointer;
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
