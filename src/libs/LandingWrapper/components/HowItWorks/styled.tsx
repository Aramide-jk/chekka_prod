"use client";

import styled from "styled-components";

export const SectionStyled = styled.section`
    padding: 120px 32px;
    max-width: 1280px;
    margin: 0 auto;
`;

export const HeadingStyled = styled.div`
    text-align: center;
    margin-bottom: 80px;

    .eyebrow { margin-bottom: 16px; }
`;

export const TitleStyled = styled.h2`
    font-family: var(--display);
    font-weight: 400;
    font-size: 64px;
    margin: 0 0 20px;
    letter-spacing: -0.02em;
    line-height: 1;

    em {
        font-style: italic;
        color: var(--gold-bright);
    }
`;

export const LedeStyled = styled.p`
    color: var(--ink-soft);
    max-width: 560px;
    margin: 0 auto;
    font-size: 16px;
`;

export const GridStyled = styled.div`
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1px;
    background: var(--hairline);
    border: 1px solid var(--hairline);
    border-radius: 22px;
    overflow: hidden;

    @media (max-width: 1100px) {
        grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
`;

export const CellStyled = styled.div`
    padding: 32px 22px;
    background: var(--surface);
    min-height: 240px;
`;

export const NumStyled = styled.div`
    font-family: var(--display);
    font-size: 28px;
    color: var(--gold);
    margin-bottom: 28px;
`;

export const StepTitleStyled = styled.div`
    font-family: var(--display);
    font-size: 24px;
    margin-bottom: 10px;
`;

export const DescStyled = styled.p`
    font-size: 13px;
    color: var(--ink-muted);
    line-height: 1.5;
`;

export const SwitchStyled = styled.div`
    display: inline-flex;
    gap: 4px;
    padding: 4px;
    margin: 4px auto 0;
    border-radius: var(--r-pill);
    border: 1px solid var(--hairline);
    background: var(--surface);
`;

export const SwitchButtonStyled = styled.button<{ $on: boolean }>`
    padding: 10px 22px;
    border-radius: var(--r-pill);
    border: none;
    cursor: pointer;
    font-size: 13px;
    font-family: var(--sans);
    background: ${(p) => (p.$on ? "var(--gold-wash)" : "transparent")};
    color: ${(p) => (p.$on ? "var(--gold-bright)" : "var(--ink-soft)")};
    transition: background 0.15s ease, color 0.15s ease;

    &:hover { color: var(--gold-bright); }
`;
