"use client";

import styled from "styled-components";

export const GridStyled = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 16px;

    @media (max-width: 540px) {
        grid-template-columns: 1fr;
    }
`;

export const RoleRowStyled = styled.div`
    display: flex;
    gap: 8px;
    margin-bottom: 18px;
`;

export const RoleButtonStyled = styled.button<{ $on: boolean }>`
    flex: 1;
    padding: 12px;
    border-radius: var(--r-sm);
    cursor: pointer;
    font-size: 13px;
    font-family: var(--sans);
    border: 1px solid ${(p) => (p.$on ? "var(--gold)" : "var(--hairline-strong)")};
    background: ${(p) => (p.$on ? "var(--gold-wash)" : "var(--surface)")};
    color: ${(p) => (p.$on ? "var(--gold-bright)" : "var(--ink-soft)")};
`;

export const RoleHintStyled = styled.p`
    font-size: 12px;
    color: var(--ink-muted);
    margin: -8px 0 18px;
    line-height: 1.5;
`;

export const AgreeStyled = styled.p`
    font-size: 12px;
    color: var(--ink-muted);
    margin: 12px 0 24px;
    line-height: 1.6;

    a { color: var(--gold-bright); }
    a:hover { text-decoration: underline; }
`;

export const ErrorBoxStyled = styled.div`
    margin: -4px 0 18px;
    padding: 10px 14px;
    background: var(--danger-wash);
    border: 1px solid var(--danger-deep);
    border-radius: var(--r-sm);
    color: var(--danger);
    font-size: 13px;
`;

export const VerifyLedeStyled = styled.p`
    font-size: 14px;
    color: var(--ink-soft);
    margin: 0 0 18px;
    line-height: 1.6;

    strong { color: var(--ink); }
`;

export const ResendRowStyled = styled.p`
    font-size: 13px;
    color: var(--ink-muted);
    margin: 16px 0 0;
    text-align: center;

    button {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        font-size: 13px;
        font-family: var(--sans);
        color: var(--gold-bright);
    }
    button:hover { text-decoration: underline; }
    button:disabled { color: var(--ink-muted); cursor: default; }
`;

export const LinkButtonStyled = styled.button`
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-family: var(--sans);
    font-size: inherit;
    color: var(--gold-bright);
    &:hover { text-decoration: underline; }
`;
