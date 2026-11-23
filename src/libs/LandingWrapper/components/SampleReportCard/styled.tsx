"use client";

import styled from "styled-components";

export const WrapStyled = styled.div`
    padding: 28px;
    background: linear-gradient(160deg, var(--surface-2), var(--surface));
    border: 1px solid var(--hairline);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-2);
`;

export const HeaderRowStyled = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
`;

export const MonoStyled = styled.span`
    font-family: var(--mono);
    font-variant-numeric: tabular-nums;
    color: var(--ink-muted);
    font-size: 11px;
`;

export const CarTitleStyled = styled.div`
    font-family: var(--display);
    font-size: 30px;
    margin-bottom: 4px;
`;

export const CarSubStyled = styled.div`
    color: var(--ink-muted);
    font-size: 13px;
    margin-bottom: 24px;
`;

export const SummaryStyled = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    margin-bottom: 24px;
`;

export const SummaryCellStyled = styled.div<{
	$tone: "good" | "caution" | "danger";
}>`
    padding: 14px;
    border-radius: 10px;
    text-align: center;
    background: var(--${(p) => p.$tone}-wash);

    .num {
        font-family: var(--display);
        font-variant-numeric: tabular-nums;
        font-size: 32px;
        color: var(--${(p) => p.$tone});
        line-height: 1;
    }

    .label { color: var(--${(p) => p.$tone}); }
`;

export const VerdictStyled = styled.div`
    padding: 20px 24px;
    background: var(--good-wash);
    border: 1px solid var(--good-deep);
    border-radius: 14px;

    .verdict-summary {
        font-size: 13px;
        color: var(--ink-soft);
        line-height: 1.5;
    }
`;

export const VerdictHeadStyled = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;

    svg { color: var(--good); }
    .label { color: var(--good); }
`;

export const VerdictTitleStyled = styled.div`
    font-family: var(--display);
    font-size: 32px;
    color: var(--ink);
    margin-bottom: 6px;
`;
