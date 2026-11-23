"use client";

import styled from "styled-components";

export const SwitcherWrapStyled = styled.div`
	position: fixed;
	bottom: 24px;
	right: 24px;
	z-index: 9999;
	font-family: var(--font-dm-sans), system-ui, sans-serif;
`;

export const FloatingPillStyled = styled.button<{ $activeRole?: string }>`
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 10px 16px;
	background: rgba(20, 19, 16, 0.94);
	color: var(--ink);
	border: 1px solid var(--gold-wash-2, rgba(201, 169, 97, 0.35));
	border-radius: 999px;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 16px rgba(201, 169, 97, 0.15);
	backdrop-filter: blur(16px);
	cursor: pointer;
	font-size: 13px;
	font-weight: 500;
	transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

	&:hover {
		border-color: var(--gold-bright, #d4af37);
		box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6), 0 0 24px rgba(201, 169, 97, 0.25);
		transform: translateY(-2px);
	}

	.bolt-icon {
		color: var(--gold-bright, #d4af37);
		display: flex;
		align-items: center;
	}

	.role-tag {
		color: var(--gold-bright, #d4af37);
		font-weight: 600;
		text-transform: capitalize;
	}

	.chevron {
		color: var(--ink-muted);
		margin-left: 2px;
	}
`;

export const PanelStyled = styled.div`
	position: absolute;
	bottom: calc(100% + 12px);
	right: 0;
	width: 320px;
	background: rgba(22, 20, 17, 0.96);
	border: 1px solid var(--gold-wash-2, rgba(201, 169, 97, 0.3));
	border-radius: var(--r-md, 12px);
	box-shadow: 0 20px 48px rgba(0, 0, 0, 0.7), 0 0 24px rgba(201, 169, 97, 0.12);
	backdrop-filter: blur(20px);
	padding: 18px;
	animation: popUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);

	@keyframes popUp {
		from {
			opacity: 0;
			transform: translateY(8px) scale(0.96);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
`;

export const PanelHeadStyled = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12px;
	padding-bottom: 10px;
	border-bottom: 1px solid var(--hairline);

	.title-group {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.title {
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--gold-bright, #d4af37);
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.sub {
		font-size: 11px;
		color: var(--ink-muted);
	}

	.close-btn {
		background: none;
		border: none;
		color: var(--ink-muted);
		cursor: pointer;
		padding: 4px;
		border-radius: 4px;
		display: flex;
		align-items: center;

		&:hover {
			color: var(--ink);
			background: var(--surface-2);
		}
	}
`;

export const RolesListStyled = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

export const RoleItemStyled = styled.button<{ $isActive?: boolean; $isBusy?: boolean }>`
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	padding: 10px 12px;
	background: ${(p) =>
		p.$isActive ? "rgba(201, 169, 97, 0.12)" : "var(--surface, #1e1b16)"};
	border: 1px solid
		${(p) =>
			p.$isActive
				? "var(--gold-bright, #d4af37)"
				: "var(--hairline, rgba(255, 255, 255, 0.08))"};
	border-radius: var(--r-sm, 8px);
	color: var(--ink);
	text-align: left;
	cursor: ${(p) => (p.$isBusy ? "wait" : "pointer")};
	transition: all 0.15s ease;

	&:hover:not(:disabled) {
		background: rgba(201, 169, 97, 0.1);
		border-color: var(--gold-bright, #d4af37);
		transform: translateX(2px);
	}

	&:disabled {
		opacity: 0.7;
	}

	.left {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.role-header {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: 600;
		font-size: 13px;
	}

	.role-desc {
		font-size: 11px;
		color: var(--ink-muted);
		max-width: 220px;
		line-height: 1.3;
	}

	.right {
		display: flex;
		align-items: center;
	}
`;

export const ActiveDotStyled = styled.span`
	display: inline-flex;
	align-items: center;
	gap: 4px;
	font-size: 10px;
	font-weight: 600;
	color: var(--good, #48bb78);
	text-transform: uppercase;
	letter-spacing: 0.05em;

	&::before {
		content: "";
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--good, #48bb78);
	}
`;
