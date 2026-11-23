"use client";

import styled from "styled-components";

export const BarStyled = styled.header`
    position: sticky;
    top: 0;
    z-index: 50;
    backdrop-filter: blur(20px);
    background: rgba(14, 13, 10, 0.72);
    border-bottom: 1px solid var(--hairline);

    [data-theme="light"] & {
        background: rgba(248, 245, 236, 0.82);
    }
`;

export const InnerStyled = styled.div`
    max-width: 1280px;
    margin: 0 auto;
    padding: 18px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

export const NavListStyled = styled.nav`
    display: flex;
    gap: 28px;
    font-size: 13px;
    color: var(--ink-soft);

    a:hover { color: var(--gold-bright); }

    @media (max-width: 900px) {
        display: none;
    }
`;

export const CTAsStyled = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

export const HideOnMobileStyled = styled.span`
    @media (max-width: 900px) {
        display: none;
    }
`;
