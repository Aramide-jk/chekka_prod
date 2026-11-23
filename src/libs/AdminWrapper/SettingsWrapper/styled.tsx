"use client";

import styled from "styled-components";
import { Card } from "@/components";

export const GridStyled = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    @media (max-width: 900px) { grid-template-columns: 1fr; }
`;
export const SectionStyled = styled(Card)`padding: 24px;`;
export const SectionHeadStyled = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;

    .section-eyebrow { margin-bottom: 4px; }
    .section-subtitle { margin-top: 6px; }
`;
export const SectionTitleStyled = styled.h2`
    font-family: var(--display);
    font-size: 22px;
    margin: 0;
`;
export const FieldRowStyled = styled.div`
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 14px;
    padding: 12px 0;
    border-bottom: 1px solid var(--hairline);
    &:last-of-type { border-bottom: none; }

    .number-control {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .number-suffix {
        color: var(--ink-muted);
        font-size: 12px;
        min-width: 28px;
    }
`;
export const FieldLabelStyled = styled.div`
    font-size: 13px;
    color: var(--ink-soft);
`;
export const FieldHintStyled = styled.div`
    font-size: 11px;
    color: var(--ink-muted);
    margin-top: 4px;
`;
export const InputStyled = styled.input`
    width: 140px;
    padding: 8px 12px;
    background: var(--surface-2);
    border: 1px solid var(--hairline);
    border-radius: var(--r-sm);
    color: var(--ink);
    font-size: 13px;
    text-align: right;
    &:focus { outline: none; border-color: var(--gold); }
`;

// Tiny iOS-style toggle so the page reads as a switchboard, not a form.
export const ToggleBaseStyled = styled.button<{ $on: boolean }>`
    width: 44px;
    height: 24px;
    border-radius: 999px;
    border: 1px solid
        ${(p) => (p.$on ? "var(--gold-deep)" : "var(--hairline-strong)")};
    background: ${(p) =>
		p.$on
			? "linear-gradient(180deg, var(--gold-bright), var(--gold))"
			: "var(--surface-2)"};
    position: relative;
    cursor: pointer;
    transition: all 0.15s ease;
    &::after {
        content: "";
        position: absolute;
        top: 1px;
        left: ${(p) => (p.$on ? "21px" : "1px")};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: ${(p) => (p.$on ? "#1A1813" : "var(--ink-muted)")};
        transition: all 0.15s ease;
    }
`;

export const SaveBarStyled = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding-top: 16px;
    margin-top: 12px;
    border-top: 1px solid var(--hairline);

    .save-actions {
        display: flex;
        gap: 10px;
    }
`;
export const SaveStatusStyled = styled.div`
    font-size: 12px;
    color: var(--ink-muted);
`;
export const ErrorTextStyled = styled.div`
    font-size: 12px;
    color: var(--danger);
`;

export const CacheNoteStyled = styled.div`
    margin-bottom: 20px;
`;
