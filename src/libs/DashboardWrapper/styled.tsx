"use client";

import styled from "styled-components";
import { Card } from "@/components";

export const GridStyled = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

export const StatsRowStyled = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;

    @media (max-width: 720px) {
        grid-template-columns: repeat(2, 1fr);
    }
`;

export const StatStyled = styled(Card)`padding: 22px;`;

export const StatLabelStyled = styled.div`
    color: var(--ink-muted);
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    margin-bottom: 14px;
`;

export const StatValueStyled = styled.div`
    font-family: var(--display);
    font-size: 36px;
    line-height: 1;
`;

export const SectionStyled = styled(Card)`padding: 24px;`;

export const SectionHeadStyled = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;

    .actions { display: flex; gap: 8px; }
`;

export const SectionTitleStyled = styled.h2`
    font-family: var(--display);
    font-size: 24px;
    margin: 0;

    &.spaced { margin-bottom: 16px; }
`;

export const RowStyled = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 0;
    gap: 12px;
    border-bottom: 1px solid var(--hairline);
    &:last-child { border-bottom: none; }

    @media (max-width: 560px) {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }
`;

export const RowMainStyled = styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
`;

export const RowSideStyled = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;

    @media (max-width: 560px) {
        padding-left: 58px;
        flex-wrap: wrap;
    }
`;

export const ThumbStyled = styled.div`
    width: 44px;
    height: 44px;
    border-radius: var(--r-sm);
    background: var(--surface-2);
    color: var(--gold);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

export const RowTextStyled = styled.div`min-width: 0;`;

export const RowTitleStyled = styled.div`
    font-size: 14px;
    color: var(--ink);
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const RowMetaStyled = styled.div`
    font-size: 12px;
    color: var(--ink-muted);
`;

export const SideStyled = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

export const EmptyStyled = styled.div`
    color: var(--ink-muted);
    font-size: 13px;
    padding: 18px 0;
    text-align: center;
`;

export const ColumnStyled = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

export const ActionStackStyled = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

export const BrokerCopyStyled = styled.p`
    color: var(--ink-soft);
    font-size: 13px;
    line-height: 1.55;
    margin-bottom: 16px;
`;
