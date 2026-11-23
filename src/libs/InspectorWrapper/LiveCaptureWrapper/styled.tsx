"use client";

import styled from "styled-components";
import { Card } from "@/components";

export const GridStyled = styled.div`
	display: grid;
	grid-template-columns: 2fr 1fr;
	gap: 24px;
	@media (max-width: 900px) { grid-template-columns: 1fr; }
	& > * { min-width: 0; }
`;
export const SectionStyled = styled(Card)`
	padding: 24px;
	@media (max-width: 640px) { padding: 20px 16px; }

	.eyebrow-spaced { margin-bottom: 12px; }

	.progress-row {
		display: flex;
		justify-content: space-between;
		padding: 10px 0;
		border-bottom: 1px solid var(--hairline);
		font-size: 13px;
	}
	.progress-label { color: var(--ink-soft); }
	.progress-value { color: var(--ink-muted); }
`;
export const SectionPickerStyled = styled.div`
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
	margin-bottom: 18px;
`;
export const PickStyled = styled.button<{ $on: boolean }>`
	padding: 8px 14px;
	border-radius: var(--r-pill);
	background: ${(p) => (p.$on ? "var(--gold-wash)" : "transparent")};
	border: 1px solid ${(p) => (p.$on ? "var(--gold-wash-2)" : "var(--hairline)")};
	color: ${(p) => (p.$on ? "var(--gold-bright)" : "var(--ink-soft)")};
	font-size: 12px;
	cursor: pointer;
`;
export const StageStyled = styled.div`
	aspect-ratio: 4 / 3;
	border-radius: var(--r-md);
	background:
		radial-gradient(120% 90% at 50% 0%, rgba(201,169,97,0.10), transparent 60%),
		var(--surface-2);
	border: 1px solid var(--hairline);
	display: grid;
	place-items: center;
	color: var(--ink-muted);

	.stage-inner { text-align: center; }
	.stage-caption { margin-top: 12px; color: var(--ink-soft); font-size: 13px; }
`;
export const CapturesStyled = styled.div`
	margin-top: 18px;
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 8px;
	@media (max-width: 540px) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
`;
export const ThumbStyled = styled.div`
	aspect-ratio: 1;
	background: var(--surface-2);
	border: 1px solid var(--hairline);
	border-radius: var(--r-sm);
	display: grid;
	place-items: center;
	color: var(--ink-faint);
	overflow: hidden;
	position: relative;

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.thumb-del {
		position: absolute;
		top: 4px;
		right: 4px;
		width: 24px;
		height: 24px;
		display: grid;
		place-items: center;
		border: none;
		border-radius: 50%;
		background: rgba(8, 8, 6, 0.6);
		color: #fff;
		cursor: pointer;
		opacity: 0;
		transition: opacity 0.12s ease;
	}
	&:hover .thumb-del,
	&:focus-within .thumb-del { opacity: 1; }
	.thumb-del:hover { background: var(--danger); }
	.thumb-del:disabled { cursor: not-allowed; opacity: 0.4; }
	@media (hover: none) {
		.thumb-del { opacity: 1; }
	}
`;
export const PendingThumbStyled = styled(ThumbStyled)`
	opacity: 0.6;
`;
export const NoticeBoxStyled = styled.div`
	margin-top: 12px;
	padding: 8px 12px;
	background: var(--gold-wash);
	border: 1px solid var(--gold-wash-2);
	border-radius: var(--r-sm);
	color: var(--gold-bright);
	font-size: 13px;
`;
export const ComposerStyled = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	margin-top: 16px;
	flex-wrap: wrap;
	input {
		flex: 1;
		min-width: 0;
		padding: 12px 16px;
		background: var(--surface-2);
		border: 1px solid var(--hairline);
		border-radius: var(--r-pill);
		color: var(--ink);
		font-size: 13px;
	}
`;
export const FileInputStyled = styled.input`
	display: none;
`;
export const SidebarStyled = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;
export const ErrorBoxStyled = styled.div`
	margin-top: 12px;
	padding: 8px 12px;
	background: var(--danger-wash);
	border: 1px solid var(--danger-deep);
	border-radius: var(--r-sm);
	color: var(--danger);
	font-size: 13px;
`;
