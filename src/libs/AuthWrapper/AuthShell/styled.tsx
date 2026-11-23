"use client";

import styled from "styled-components";

export const CanvasStyled = styled.div`
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1.05fr 1fr;
    background: var(--bg);
    color: var(--ink);

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

export const LeftStyled = styled.div`
    padding: 32px 48px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border-right: 1px solid var(--hairline);
    background:
        radial-gradient(60% 60% at 20% 10%, var(--gold-wash) 0%, transparent 60%),
        var(--bg-tint);

    @media (max-width: 900px) {
        display: none;
    }

    .copyright {
        color: var(--ink-faint);
        font-size: 12px;
    }
`;

export const QuoteStyled = styled.div`
    max-width: 460px;

    blockquote {
        font-family: var(--display);
        font-size: 36px;
        line-height: 1.15;
        letter-spacing: -0.02em;

        em {
            font-style: italic;
            color: var(--gold-bright);
        }
    }

    cite {
        display: block;
        margin-top: 22px;
        font-style: normal;
        color: var(--ink-muted);
        font-size: 12px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
    }
`;

export const RightStyled = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 32px;
`;

export const FormStyled = styled.div`
    width: 100%;
    max-width: 440px;
`;

export const TitleStyled = styled.h1`
    font-family: var(--display);
    font-weight: 400;
    font-size: 44px;
    letter-spacing: -0.02em;
    line-height: 1;
    margin: 12px 0 14px;

    em {
        font-style: italic;
        color: var(--gold-bright);
    }
`;

export const SubtitleStyled = styled.p`
    color: var(--ink-soft);
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 32px;
`;

export const FooterStyled = styled.div`
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid var(--hairline);
    color: var(--ink-muted);
    font-size: 13px;

    a {
        color: var(--gold-bright);

        &:hover { text-decoration: underline; }
    }
`;
