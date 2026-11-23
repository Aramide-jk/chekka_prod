"use client";

import styled from "styled-components";

export const SectionStyled = styled.section`
    padding: 60px 32px 120px;
    max-width: 1280px;
    margin: 0 auto;
`;

export const HeadingStyled = styled.div`
    text-align: center;
    margin-bottom: 56px;

    .eyebrow { margin-bottom: 16px; }
`;

export const TitleStyled = styled.h2`
    font-family: var(--display);
    font-size: 56px;
    letter-spacing: -0.02em;
    line-height: 1;
    margin: 0;

    em {
        font-style: italic;
        color: var(--gold-bright);
    }
`;

export const GridStyled = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;

    @media (max-width: 1100px) {
        grid-template-columns: 1fr;
    }
`;

export const CardStyled = styled.div<{ $popular?: boolean }>`
    padding: 32px;
    position: relative;
    background: ${(p) =>
		p.$popular
			? "linear-gradient(180deg, var(--surface-2), var(--surface))"
			: "var(--surface)"};
    border: 1px solid ${(p) =>
		p.$popular ? "var(--gold-wash-2)" : "var(--hairline)"};
    border-radius: var(--r-md);
    box-shadow: ${(p) =>
		p.$popular ? "var(--shadow-gold)" : "var(--shadow-1)"};

    .cta-link { display: block; }
`;

export const PopularTagStyled = styled.div`
    position: absolute;
    top: -12px;
    left: 24px;
`;

export const NameStyled = styled.div<{ $popular?: boolean }>`
    font-family: var(--display);
    font-size: 34px;
    margin-bottom: 6px;
    color: ${(p) => (p.$popular ? "var(--gold-bright)" : "var(--ink)")};
`;

export const PriceStyled = styled.div`
    font-family: var(--display);
    font-variant-numeric: tabular-nums;
    font-size: 48px;
    margin-bottom: 12px;
`;

export const DescStyled = styled.p`
    color: var(--ink-muted);
    font-size: 13px;
    margin-bottom: 24px;
    line-height: 1.5;
`;

export const FeaturesStyled = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 28px;
`;

export const FeatureStyled = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;

    svg { color: var(--gold); }
`;
