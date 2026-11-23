"use client";

import styled from "styled-components";

export const ErrorBoxStyled = styled.div`
    margin-bottom: 18px;
    padding: 10px 14px;
    background: var(--danger-wash);
    border: 1px solid var(--danger-deep);
    border-radius: var(--r-sm);
    color: var(--danger);
    font-size: 13px;
`;

export const SuccessBoxStyled = styled.div`
    margin-bottom: 18px;
    padding: 10px 14px;
    background: rgba(34, 197, 94, 0.12);
    border: 1px solid rgba(34, 197, 94, 0.4);
    border-radius: var(--r-sm);
    color: #4ade80;
    font-size: 13px;
`;

export const InfoBoxStyled = styled.div`
    margin-bottom: 18px;
    padding: 10px 14px;
    background: rgba(201, 169, 97, 0.1);
    border: 1px solid rgba(201, 169, 97, 0.3);
    border-radius: var(--r-sm);
    color: var(--gold-bright);
    font-size: 13px;
    line-height: 1.5;
`;

export const RowStyled = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 14px;
    font-size: 13px;

    button {
        background: none;
        border: none;
        color: var(--gold-bright);
        cursor: pointer;
        font-size: 13px;
        padding: 0;

        &:hover {
            text-decoration: underline;
        }

        &:disabled {
            color: var(--ink-muted);
            cursor: not-allowed;
        }
    }
`;
