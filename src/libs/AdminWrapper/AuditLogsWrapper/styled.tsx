"use client";

import styled from "styled-components";
import { Card } from "@/components";

export const SectionStyled = styled(Card)`
    padding: 24px;

    .recent { margin-bottom: 14px; }
`;
export const RowStyled = styled.div`
    display: grid;
    grid-template-columns: 160px 1fr 220px auto;
    align-items: flex-start;
    gap: 14px;
    padding: 14px 0;
    border-bottom: 1px solid var(--hairline);
    font-size: 13px;
    &:last-child { border-bottom: none; }
    @media (max-width: 720px) { grid-template-columns: 1fr; }

    .action-time {
        color: var(--ink-muted);
        font-size: 11px;
        margin-top: 6px;
    }
    .actor {
        color: var(--ink-soft);
    }
    .target {
        color: var(--ink-muted);
        font-size: 12px;
        margin-top: 4px;
    }
`;
export const MonoStyled = styled.code`
    font-family: var(--mono, monospace);
    color: var(--ink-muted);
    font-size: 12px;
    word-break: break-word;
    display: block;
`;
export const EmptyStyled = styled.div`
    color: var(--ink-muted);
    padding: 24px 0;
    text-align: center;
    font-size: 13px;
`;
