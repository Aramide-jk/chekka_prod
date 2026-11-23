"use client";

import styled from "styled-components";
import { Card } from "@/components";

export const SectionStyled = styled(Card)`
    padding: 24px;

    .results-label { margin-bottom: 14px; }
    .error-line {
        margin-top: 14px;
        color: var(--danger);
        font-size: 13px;
    }
`;

export const FiltersRowStyled = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 18px;
`;

export const FilterChipStyled = styled.button<{ $active: boolean }>`
    border: 1px solid
        ${(p) => (p.$active ? "var(--gold)" : "var(--hairline)")};
    background: ${(p) =>
		p.$active ? "rgba(212, 175, 55, 0.12)" : "transparent"};
    color: ${(p) => (p.$active ? "var(--gold-bright)" : "var(--ink-soft)")};
    padding: 7px 14px;
    border-radius: var(--r-pill);
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;

    &:hover {
        color: var(--gold-bright);
    }
`;

export const RowStyled = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr 1.2fr 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 14px 0;
    border-bottom: 1px solid var(--hairline);
    font-size: 13px;
    &:last-child {
        border-bottom: none;
    }

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

export const RowNameStyled = styled.div`
    font-size: 14px;
`;

export const RowMetaStyled = styled.div`
    color: var(--ink-muted);

    .inspector-name { color: var(--ink); }
    .row-time { font-size: 11px; }
`;

export const EmptyStyled = styled.div`
    color: var(--ink-muted);
    padding: 24px 0;
    text-align: center;
    font-size: 13px;
`;

export const RowActionsStyled = styled.div`
    display: inline-flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
`;

export const ModalStyled = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 16px;
`;

export const ModalCardStyled = styled(Card)`
    padding: 24px;
    max-width: 520px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;

    .reassign-label { margin-bottom: 10px; }
    .reassign-sub {
        font-size: 14px;
        margin-bottom: 16px;
    }
    .muted-line {
        color: var(--ink-muted);
        font-size: 13px;
    }
    .error-line {
        margin-top: 10px;
        color: var(--danger);
        font-size: 13px;
    }
`;

export const InspectorOptionStyled = styled.button<{ $active: boolean }>`
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 12px 14px;
    border: 1px solid
        ${(p) => (p.$active ? "var(--gold)" : "var(--hairline)")};
    background: ${(p) =>
		p.$active ? "rgba(212, 175, 55, 0.10)" : "transparent"};
    color: var(--ink);
    border-radius: var(--r-sm);
    margin-bottom: 8px;
    cursor: pointer;
    text-align: left;
    font-size: 13px;

    &:hover {
        background: var(--surface-2);
    }

    .opt-meta { color: var(--ink-muted); }
`;

export const ModalActionsStyled = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 18px;
`;
