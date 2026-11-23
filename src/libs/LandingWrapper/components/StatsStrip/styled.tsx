"use client";

import styled from "styled-components";
import { Eyebrow } from "@/components";

export const SectionStyled = styled.section`
    border-top: 1px solid var(--hairline);
    border-bottom: 1px solid var(--hairline);
    background: var(--bg-tint);
`;

export const InnerStyled = styled.div`
    max-width: 1280px;
    margin: 0 auto;
    padding: 40px 32px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 32px;

    @media (max-width: 900px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 32px 24px;
    }
`;

export const StatNumberStyled = styled.div`
    font-family: var(--display);
    font-variant-numeric: tabular-nums;
    font-size: 44px;
    color: var(--gold-bright);
    line-height: 1;
`;

export const EyebrowStyled = styled(Eyebrow)`
    margin-top: 6px;
`;
