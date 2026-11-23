"use client";

import styled from "styled-components";
import { Card } from "@/components";

export const GridStyled = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 16px;
	margin-bottom: 24px;
	@media (max-width: 720px) { grid-template-columns: 1fr; }
`;

export const StatStyled = styled(Card)<{ $blur: boolean }>`
	padding: 24px;
	transition: filter 0.2s ease;
	${(p) => p.$blur && "filter: blur(10px);"}
`;

export const ValueStyled = styled.div`
	font-family: var(--display);
	font-size: 44px;
	margin-top: 6px;
	color: var(--gold-bright);
`;

export const BankCardStyled = styled(Card)<{ $warning?: boolean }>`
	padding: 20px 24px;
	margin-bottom: 24px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	border-color: ${(p) => (p.$warning ? "rgba(224, 90, 71, 0.4)" : "var(--hairline)")};
	background: ${(p) => (p.$warning ? "rgba(224, 90, 71, 0.05)" : "var(--surface)")};

	@media (max-width: 640px) {
		flex-direction: column;
		align-items: flex-start;
	}

	.bank-left {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.bank-icon {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: ${(p) => (p.$warning ? "rgba(224, 90, 71, 0.15)" : "var(--surface-2)")};
		color: ${(p) => (p.$warning ? "var(--danger)" : "var(--gold-bright)")};
		flex-shrink: 0;
	}

	.bank-details {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.bank-title {
		font-weight: 600;
		font-size: 15px;
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.bank-sub {
		font-size: 13px;
		color: var(--ink-muted);
	}
`;

export const SectionStyled = styled(Card)`
	padding: 24px;

	.eyebrow { margin-bottom: 14px; }
`;

export const RowStyled = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 0;
	border-bottom: 1px solid var(--hairline);
	font-size: 13px;
	&:last-child { border-bottom: none; }

	.tx-label {
		display: flex;
		gap: 12px;
		align-items: center;
	}

	.tx-date { color: var(--ink-muted); }

	.tx-amount {
		color: var(--gold-bright);
		filter: none;
	}
	.tx-amount.blurred { filter: blur(8px); }
`;

export const EmptyStyled = styled.div`
	color: var(--ink-muted);
	padding: 24px 0;
	text-align: center;
	font-size: 13px;
`;
