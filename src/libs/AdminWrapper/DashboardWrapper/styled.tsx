"use client";

import styled from "styled-components";
import { Card } from "@/components";

export const StatsRowStyled = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;

    @media (max-width: 720px) {
        grid-template-columns: repeat(2, 1fr);
    }
`;

export const StatStyled = styled(Card)`
    padding: 20px;
`;

export const StatLabelStyled = styled.div`
    color: var(--ink-muted);
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    margin-bottom: 10px;
`;

export const StatValueStyled = styled.div`
    font-family: var(--display);
    font-size: 30px;
    line-height: 1;
`;

export const GridStyled = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;

    @media (max-width: 720px) {
        grid-template-columns: 1fr;
    }
`;

export const TileStyled = styled(Card)`
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

export const TileHeadStyled = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

export const TileTitleStyled = styled.h2`
    font-family: var(--display);
    font-size: 22px;
    margin: 0;
`;

export const SectionDividerStyled = styled.div`
    margin: 32px 0 16px;
    color: var(--ink-muted);
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    border-top: 1px solid var(--hairline);
    padding-top: 16px;
`;

export const EmptyTileStyled = styled.div`
    padding: 24px;
    text-align: center;
    color: var(--ink-muted);
    font-size: 13px;
    border: 1px dashed var(--hairline);
    border-radius: var(--r-sm);
`;
