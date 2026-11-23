"use client";

import styled from "styled-components";
import { Card } from "@/components";

export const SectionStyled = styled(Card)`
    padding: 24px;

    .results-eyebrow { margin-bottom: 14px; }
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

export const RowStyled = styled.button`
    display: grid;
    grid-template-columns: 40px 2fr 1fr 1fr 1fr 24px;
    align-items: center;
    gap: 12px;
    padding: 14px 6px;
    border: none;
    border-bottom: 1px solid var(--hairline);
    background: transparent;
    width: 100%;
    text-align: left;
    color: var(--ink);
    font-size: 13px;
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
        background: var(--surface-2);
    }

    &:last-of-type {
        border-bottom: none;
    }

    @media (max-width: 900px) {
        grid-template-columns: 40px 1fr auto;
    }
`;

export const RowNameStyled = styled.div`
    font-size: 14px;
`;

export const RowMetaStyled = styled.div`
    color: var(--ink-muted);
`;

export const RowChevronStyled = styled.div`
    color: var(--ink-muted);
    display: inline-flex;
    align-items: center;
    justify-content: center;
`;

export const EmptyStyled = styled.div`
    color: var(--ink-muted);
    padding: 24px 0;
    text-align: center;
    font-size: 13px;
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
    max-width: 640px;
    width: 100%;
    max-height: 86vh;
    overflow-y: auto;

    .no-docs {
        color: var(--ink-muted);
        font-size: 13px;
    }

    .error-line {
        margin-top: 14px;
        color: var(--danger);
        font-size: 13px;
    }
`;

export const ModalHeadStyled = styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 18px;
    flex-wrap: wrap;

    .head-id {
        flex: 1;
        min-width: 0;
    }
`;

export const ModalTitleStyled = styled.div`
    font-family: var(--display);
    font-size: 22px;
    line-height: 1.1;
`;

export const ModalSubtitleStyled = styled.div`
    color: var(--ink-muted);
    font-size: 13px;
    margin-top: 2px;
`;

export const DetailGridStyled = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 24px;

    @media (max-width: 560px) {
        grid-template-columns: 1fr;
    }
`;

export const DetailRowStyled = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid var(--hairline);
    font-size: 13px;

    span:first-child {
        color: var(--ink-muted);
    }

    span:last-child {
        color: var(--ink);
        text-align: right;
        word-break: break-word;
    }
`;

export const SectionLabelStyled = styled.div`
    margin-top: 18px;
    margin-bottom: 10px;
    color: var(--ink-muted);
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
`;

export const BioStyled = styled.p`
    margin: 0;
    font-size: 14px;
    line-height: 1.55;
    color: var(--ink);
    white-space: pre-wrap;
`;

export const TagsStyled = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
`;

export const DocListStyled = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const DocChipStyled = styled.a`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    border: 1px solid var(--hairline);
    border-radius: var(--r-sm);
    padding: 10px 12px;
    font-size: 13px;
    color: var(--ink);
    text-decoration: none;
    cursor: pointer;
    transition: border-color 0.12s ease, background 0.12s ease;

    &:hover {
        border-color: var(--gold);
        background: var(--surface-2);
    }

    .doc-open {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--gold-bright);
        font-size: 12px;
    }
`;

export const ModalActionsStyled = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 24px;
    flex-wrap: wrap;
`;
