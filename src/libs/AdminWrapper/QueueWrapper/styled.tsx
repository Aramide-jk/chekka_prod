"use client";

import styled from "styled-components";
import { Card } from "@/components";

export const SectionStyled = styled(Card)`
    padding: 24px;

    .queue-count { margin-bottom: 14px; }

    .error-line {
        margin-top: 14px;
        color: var(--danger);
        font-size: 13px;
    }
`;
export const RowStyled = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 14px 0;
    border-bottom: 1px solid var(--hairline);
    font-size: 13px;
    &:last-child { border-bottom: none; }
    @media (max-width: 720px) {
        grid-template-columns: 1fr;
    }
`;
export const RowNameStyled = styled.div`font-size: 14px;`;
export const RowMetaStyled = styled.div`color: var(--ink-muted);`;
export const EmptyStyled = styled.div`
    color: var(--ink-muted);
    padding: 24px 0;
    text-align: center;
    font-size: 13px;
`;
export const OverlayStyled = styled.div`
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(8, 8, 6, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
`;
export const ModalStyled = styled(Card)`
    width: 100%;
    max-width: 480px;
    padding: 26px;
    max-height: 90vh;
    overflow-y: auto;

    .modal-eyebrow { margin-bottom: 10px; }

    .modal-subject {
        color: var(--ink-soft);
        font-size: 14px;
        margin-bottom: 18px;
    }

    .resolve-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .assign-actions {
        display: flex;
        gap: 10px;
    }
`;
export const ModalFieldStyled = styled.label`
    display: block;
    margin: 0 0 14px;
    span {
        display: block;
        color: var(--ink-soft);
        font-size: 12px;
        margin-bottom: 6px;
    }
    input, select {
        width: 100%;
        padding: 10px 12px;
        background: var(--surface-2);
        border: 1px solid var(--hairline-strong);
        border-radius: var(--r-sm);
        color: var(--ink);
        font-family: var(--sans);
        font-size: 14px;
    }
`;
export const ModalErrStyled = styled.div`
    color: var(--danger);
    font-size: 13px;
    margin-bottom: 12px;
`;

// Read-only breakdown of who/what a dispute involves, shown above the resolve
// actions in the admin dispute modal.
export const DisputeDetailStyled = styled.div`
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 20px;

    .dd-section {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .dd-label {
        color: var(--ink-soft);
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }

    .dd-party {
        font-size: 14px;
        color: var(--ink);
    }

    .dd-contact {
        font-size: 12px;
        color: var(--ink-muted);
    }

    .dd-statement {
        font-size: 14px;
        color: var(--ink-soft);
        line-height: 1.5;
        padding: 12px 14px;
        background: var(--surface-2);
        border: 1px solid var(--hairline);
        border-radius: var(--r-sm);
        white-space: pre-wrap;
    }

    .dd-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
    }
`;
