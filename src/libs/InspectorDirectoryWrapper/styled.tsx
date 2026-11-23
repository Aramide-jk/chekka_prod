"use client";

import styled from "styled-components";
import { Card } from "@/components";

export const IntroRowStyled = styled.div`
	display: flex;
	gap: 12px;
	flex-wrap: wrap;
	margin-bottom: 24px;
`;

export const FilterRowStyled = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	margin-bottom: 18px;

	.filter-select {
		min-width: 200px;
	}

	@media (max-width: 540px) {
		flex-direction: column;
		align-items: stretch;
		.filter-select {
			min-width: 0;
		}
	}
`;

export const GridStyled = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 16px;
`;

export const CardStyled = styled(Card)`
	padding: 20px;
	display: flex;
	flex-direction: column;
	gap: 14px;

	.book-link {
		margin-top: auto;
	}
`;

export const CardTopStyled = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;

	.who {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.name {
		font-family: var(--display);
		font-size: 17px;
	}
`;

export const MetaStyled = styled.div`
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 6px;
	font-size: 13px;
	color: var(--ink-soft);

	.rating {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}

	.dot {
		color: var(--ink-muted);
	}
`;

export const SpecsStyled = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
`;

export const EmptyStyled = styled(Card)`
	padding: 28px;
	text-align: center;
	color: var(--ink-muted);
	font-size: 14px;
	margin-bottom: 18px;
`;
