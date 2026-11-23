"use client";

import styled from "styled-components";

export const WrapStyled = styled.label`
    display: block;
    margin-bottom: 18px;
`;

export const LabelRowStyled = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
`;

export const LabelStyled = styled.span`
    font-size: 12px;
    color: var(--ink-soft);
    letter-spacing: 0.04em;
`;

export const HintStyled = styled.span`
    font-size: 11px;
    color: var(--ink-muted);
`;

export const InputWrapStyled = styled.div`
    position: relative;
`;

export const InputStyled = styled.input<{ $hasToggle: boolean }>`
    width: 100%;
    padding: 14px 16px;
    padding-right: ${(p) => (p.$hasToggle ? "46px" : "16px")};
    background: var(--surface);
    border: 1px solid var(--hairline-strong);
    border-radius: var(--r-sm);
    color: var(--ink);
    font-size: 14px;
    transition: border-color 0.15s ease, background 0.15s ease;

    &::placeholder {
        color: var(--ink-faint);
    }

    &:focus {
        border-color: var(--gold);
        background: var(--surface-2);
    }
`;

export const ToggleStyled = styled.button`
    position: absolute;
    top: 50%;
    right: 8px;
    transform: translateY(-50%);
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--ink-muted);
    cursor: pointer;
    border-radius: var(--r-sm);

    &:hover { color: var(--gold-bright); }
`;
