"use client";

import styled from "styled-components";

export const WrapStyled = styled.div`
    padding: 24px;
    background: linear-gradient(180deg, var(--surface-2), var(--bg-tint));
    border: 1px solid var(--hairline);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-2);
    transform: rotate(0.3deg);
`;

export const RowStyled = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    &.lead { gap: 10px; }

    &.note-head { margin-bottom: 8px; }
    .author { font-size: 11px; color: var(--gold); }

    &.footer { margin-top: 14px; }
    .who { flex: 1; margin-left: 12px; }
    .name { font-size: 13px; }
    .role { font-size: 11px; color: var(--ink-muted); }
    .photos { color: var(--gold); }
`;

export const DotStyled = styled.span`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--gold-bright);
    display: inline-block;
    animation: pulse 1.4s ease-in-out infinite;
`;

export const PhotoGridStyled = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin: 18px 0 16px;
`;

export const NoteCardStyled = styled.div`
    padding: 14px;
    background: var(--surface);
    border-radius: 12px;
    border: 1px solid var(--hairline);

    .note { font-size: 13px; color: var(--ink-soft); line-height: 1.5; }
`;

export const MonoStyled = styled.span`
    font-family: var(--mono);
    font-variant-numeric: tabular-nums;
    color: var(--ink-muted);
    font-size: 11px;
`;
