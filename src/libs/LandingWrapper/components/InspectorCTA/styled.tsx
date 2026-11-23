"use client";

import styled from "styled-components";
import { Card, Eyebrow } from "@/components";

export const SectionStyled = styled.section`
    padding: 100px 32px;
    max-width: 1280px;
    margin: 0 auto;
`;

export const Card2Styled = styled.div`
    padding: 60px 56px;
    background: linear-gradient(120deg, var(--surface-2), var(--bg-tint));
    border: 1px solid var(--gold-wash-2);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-2);
    position: relative;
    overflow: hidden;

    @media (max-width: 700px) {
        padding: 40px 28px;
    }
`;

export const GlowStyled = styled.div`
    position: absolute;
    inset: 0;
    opacity: 0.4;
    background: radial-gradient(circle at 80% 50%, var(--gold-wash) 0%, transparent 50%);
`;

export const GridStyled = styled.div`
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 60px;
    align-items: center;
    position: relative;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
        gap: 40px;
    }
`;

export const EyebrowStyled = styled(Eyebrow)`
    margin-bottom: 14px;
`;

export const TitleStyled = styled.h2`
    font-family: var(--display);
    font-size: 52px;
    line-height: 1;
    margin: 0 0 20px;
    letter-spacing: -0.02em;
`;

export const LedeStyled = styled.p`
    color: var(--ink-soft);
    font-size: 15px;
    max-width: 480px;
    margin-bottom: 28px;
`;

export const StatsColStyled = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

export const StatCardStyled = styled(Card)`
    padding: 16px 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .label { color: var(--ink-muted); font-size: 13px; }
`;

export const StatNumStyled = styled.span`
    font-family: var(--display);
    font-variant-numeric: tabular-nums;
    font-size: 28px;
    color: var(--gold-bright);
`;
