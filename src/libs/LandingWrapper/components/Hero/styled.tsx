"use client";

import styled from "styled-components";

export const SectionStyled = styled.section`
    position: relative;
    padding: 80px 32px 100px;
    max-width: 1280px;
    margin: 0 auto;
`;

export const GridStyled = styled.div`
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 60px;
    align-items: center;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
        gap: 60px;
    }
`;

export const BadgeStyled = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 6px 14px;
    border: 1px solid var(--hairline-strong);
    border-radius: 999px;
    margin-bottom: 32px;

    .eyebrow { font-size: 10px; }
`;

export const DotStyled = styled.span`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--gold-bright);
    display: inline-block;
`;

export const TitleStyled = styled.h1`
    font-family: var(--display);
    font-weight: 400;
    font-size: clamp(56px, 7vw, 96px);
    line-height: 0.95;
    margin-bottom: 24px;
    letter-spacing: -0.02em;

    em {
        font-style: italic;
        color: var(--gold-bright);
    }
`;

export const SubStyled = styled.p`
    font-size: 18px;
    line-height: 1.5;
    color: var(--ink-soft);
    max-width: 520px;
    margin-bottom: 36px;
`;

export const ButtonsStyled = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;

    @media (max-width: 540px) {
        flex-direction: column;
        align-items: stretch;
        button { width: 100%; justify-content: center; }
    }
`;

export const TrustStyled = styled.div`
    display: flex;
    gap: 32px;
    margin-top: 56px;
    color: var(--ink-muted);
    font-size: 12px;

    @media (max-width: 540px) {
        flex-direction: column;
        gap: 12px;
    }
`;

export const TrustItemStyled = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;

    svg { color: var(--gold); }
`;
