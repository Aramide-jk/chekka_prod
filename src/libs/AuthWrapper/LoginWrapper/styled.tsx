"use client";

import styled from "styled-components";

export const RowStyled = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: -8px 0 24px;
    font-size: 12px;
    color: var(--ink-muted);

    a { color: var(--gold-bright); }
    a:hover { text-decoration: underline; }
`;

export const DividerStyled = styled.div`
    text-align: center;
    margin: 28px 0;
    color: var(--ink-faint);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    position: relative;

    &::before, &::after {
        content: "";
        position: absolute;
        top: 50%;
        width: 40%;
        height: 1px;
        background: var(--hairline);
    }
    &::before { left: 0; }
    &::after  { right: 0; }
`;

export const ErrorBoxStyled = styled.div`
    margin: -4px 0 18px;
    padding: 10px 14px;
    background: var(--danger-wash);
    border: 1px solid var(--danger-deep);
    border-radius: var(--r-sm);
    color: var(--danger);
    font-size: 13px;
`;

export const DemoSectionStyled = styled.div`
	margin-bottom: 24px;
	padding: 16px;
	background: rgba(201, 169, 97, 0.06);
	border: 1px dashed var(--gold-wash-2, rgba(201, 169, 97, 0.4));
	border-radius: var(--r-md, 12px);

	.demo-header {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 12px;
		font-size: 12px;
		font-weight: 600;
		color: var(--gold-bright, #d4af37);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.demo-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;

		@media (max-width: 480px) {
			grid-template-columns: 1fr;
		}
	}

	.demo-btn {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 12px;
		background: var(--surface, #1e1b16);
		border: 1px solid var(--hairline, rgba(255, 255, 255, 0.08));
		border-radius: var(--r-sm, 6px);
		color: var(--ink);
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;

		&:hover:not(:disabled) {
			border-color: var(--gold-bright, #d4af37);
			background: rgba(201, 169, 97, 0.12);
			transform: translateY(-1px);
		}

		&:disabled {
			opacity: 0.6;
			cursor: wait;
		}

		.btn-title {
			display: flex;
			align-items: center;
			gap: 6px;
			font-weight: 600;
		}
	}
`;
