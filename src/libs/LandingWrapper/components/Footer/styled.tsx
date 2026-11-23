"use client";

import styled from "styled-components";
import { Eyebrow } from "@/components";

export const WrapStyled = styled.footer`
    padding: 60px 32px 40px;
    border-top: 1px solid var(--hairline);
`;

export const InnerStyled = styled.div`
    max-width: 1280px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr 1fr;
    gap: 40px;

    @media (max-width: 900px) {
        grid-template-columns: 1fr 1fr;
        gap: 40px;
    }
    @media (max-width: 540px) {
        grid-template-columns: 1fr;
    }
`;

export const BrandStyled = styled.p`
    color: var(--ink-muted);
    font-size: 13px;
    margin-top: 16px;
    max-width: 320px;
    line-height: 1.5;
`;

export const EyebrowStyled = styled(Eyebrow)`
    margin-bottom: 18px;
`;

export const StackStyled = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: 13px;
    color: var(--ink-soft);

    a {
        color: var(--ink-soft);
        text-decoration: none;
        transition: color 0.15s ease;
    }
    a:hover {
        color: var(--gold-bright);
    }
`;

export const BottomStyled = styled.div`
    max-width: 1280px;
    margin: 48px auto 0;
    padding-top: 24px;
    border-top: 1px solid var(--hairline);
    display: flex;
    justify-content: space-between;
    color: var(--ink-faint);
    font-size: 12px;

    @media (max-width: 540px) {
        flex-direction: column;
        gap: 8px;
    }
`;
