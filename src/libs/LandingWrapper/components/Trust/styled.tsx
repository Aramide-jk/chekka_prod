"use client";

import styled from "styled-components";
import { Eyebrow } from "@/components";

export const SectionStyled = styled.section`
    padding: 100px 32px;
    background: var(--bg-tint);
    border-top: 1px solid var(--hairline);
    border-bottom: 1px solid var(--hairline);
`;

export const InnerStyled = styled.div`
    max-width: 1280px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
        gap: 60px;
    }
`;

export const EyebrowStyled = styled(Eyebrow)`
    margin-bottom: 16px;
`;

export const TitleStyled = styled.h2`
    font-family: var(--display);
    font-size: 56px;
    line-height: 1;
    margin: 0 0 24px;
    letter-spacing: -0.02em;

    em {
        font-style: italic;
        color: var(--gold-bright);
    }
`;

export const LedeStyled = styled.p`
    color: var(--ink-soft);
    font-size: 16px;
    margin-bottom: 32px;
    max-width: 480px;
`;

export const PillarsStyled = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

export const PillarRowStyled = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 16px;

    .title { font-size: 15px; font-weight: 500; margin-bottom: 4px; }
    .desc { color: var(--ink-muted); font-size: 13px; line-height: 1.5; }
`;

export const IconBoxStyled = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    border: 1px solid var(--hairline-strong);
    background: var(--gold-wash);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gold-bright);
    flex-shrink: 0;
`;
