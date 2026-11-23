"use client";

import styled from "styled-components";

export const ErrorBoxStyled = styled.div`
    margin: -4px 0 18px;
    padding: 10px 14px;
    background: var(--danger-wash);
    border: 1px solid var(--danger-deep);
    border-radius: var(--r-sm);
    color: var(--danger);
    font-size: 13px;
`;

export const InfoBoxStyled = styled.div`
    margin: -4px 0 18px;
    padding: 10px 14px;
    background: var(--surface-2);
    border: 1px solid var(--hairline);
    border-radius: var(--r-sm);
    color: var(--ink-soft);
    font-size: 13px;

    &.compact { margin-bottom: 16px; }

    .pill-row { margin-bottom: 6px; }
`;

export const ButtonRowStyled = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 14px;
    flex-wrap: wrap;
`;
