"use client";

import styled from "styled-components";

export const CanvasStyled = styled.div`
    min-height: 100vh;
    display: grid;
    grid-template-rows: auto 1fr auto;
    background: var(--bg);
    color: var(--ink);
`;

export const TopStyled = styled.div`
    padding: 24px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--hairline);
`;

export const StepCountStyled = styled.div`
    color: var(--ink-muted);
    font-size: 12px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
`;

export const BodyStyled = styled.section`
    display: grid;
    place-items: center;
    padding: 64px 32px;
`;

export const SlideStyled = styled.div`
    max-width: 540px;
    text-align: center;
    animation: fadeUp 0.3s ease both;
`;

export const IconWrapStyled = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: var(--gold-wash);
    border: 1px solid var(--gold-wash-2);
    color: var(--gold-bright);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 32px;
`;

export const TitleStyled = styled.h1`
    font-family: var(--display);
    font-weight: 400;
    font-size: clamp(40px, 6vw, 64px);
    line-height: 1;
    letter-spacing: -0.02em;
    margin: 16px 0;

    em {
        font-style: italic;
        color: var(--gold-bright);
    }
`;

export const LedeStyled = styled.p`
    color: var(--ink-soft);
    font-size: 16px;
    line-height: 1.6;
    margin-top: 24px;
`;

export const BottomStyled = styled.div`
    padding: 24px 32px;
    border-top: 1px solid var(--hairline);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
`;

export const DotsStyled = styled.div`
    display: flex;
    gap: 8px;
`;

export const DotStyled = styled.span<{ $on: boolean }>`
    width: ${(p) => (p.$on ? 24 : 8)}px;
    height: 8px;
    border-radius: 4px;
    background: ${(p) => (p.$on ? "var(--gold-bright)" : "var(--surface-3)")};
    transition: all 0.2s ease;
`;

export const ActionsStyled = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;
