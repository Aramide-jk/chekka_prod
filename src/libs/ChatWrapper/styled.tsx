"use client";

import styled from "styled-components";
import { Card } from "@/components";

export const GridStyled = styled.div`
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 16px;
    height: 70vh;
    min-height: 540px;
    @media (max-width: 720px) { grid-template-columns: 1fr; height: auto; }
`;

export const SidebarStyled = styled(Card)`
    padding: 14px;
    overflow-y: auto;

    .conversations-label { padding: 6px 12px 14px; }
`;

export const ContactRowStyled = styled.button<{ $on: boolean }>`
    width: 100%;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: var(--r-sm);
    background: ${(p) => (p.$on ? "var(--surface-2)" : "transparent")};
    border: 1px solid ${(p) => (p.$on ? "var(--hairline-strong)" : "transparent")};
    color: var(--ink);
    cursor: pointer;
    &:hover { background: var(--surface-2); }
`;

export const ContactInfoStyled = styled.div`min-width: 0; flex: 1;`;

export const ContactNameStyled = styled.div`
    font-size: 14px;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
`;

export const ContactMetaStyled = styled.div`
    color: var(--ink-muted);
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const ChatPaneStyled = styled(Card)`
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .error-line {
        padding: 8px 18px;
        color: var(--danger);
        font-size: 12px;
    }
`;

export const ChatHeadStyled = styled.div`
    padding: 16px 22px;
    border-bottom: 1px solid var(--hairline);
    display: flex;
    align-items: center;
    justify-content: space-between;

    .who {
        display: flex;
        align-items: center;
        gap: 12px;

        .name { font-size: 14px; }
        .sub { color: var(--ink-muted); font-size: 12px; }
    }
`;

export const MessagesStyled = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
`;

export const BubbleStyled = styled.div<{ $mine: boolean }>`
    align-self: ${(p) => (p.$mine ? "flex-end" : "flex-start")};
    max-width: 70%;
    padding: 12px 16px;
    border-radius: var(--r-md);
    background: ${(p) => (p.$mine ? "var(--gold-wash)" : "var(--surface-2)")};
    border: 1px solid ${(p) => (p.$mine ? "var(--gold-wash-2)" : "var(--hairline)")};
    color: var(--ink);
    font-size: 14px;
    line-height: 1.55;
`;

export const RecoCardStyled = styled.div<{ $mine: boolean }>`
    align-self: ${(p) => (p.$mine ? "flex-end" : "flex-start")};
    max-width: 74%;
    padding: 14px 16px;
    border-radius: var(--r-md);
    background: var(--gold-wash);
    border: 1px solid var(--gold);
    display: flex;
    flex-direction: column;
    gap: 8px;

    .reco-desc { font-size: 14px; }
    .reco-price { color: var(--gold-bright); font-size: 13px; }
`;

export const SystemLineStyled = styled.div`
    align-self: center;
    color: var(--caution);
    font-size: 12px;
    background: var(--caution-wash);
    border: 1px solid var(--caution-deep);
    padding: 6px 12px;
    border-radius: var(--r-pill);
`;

export const ComposerStyled = styled.form`
    padding: 14px 18px;
    border-top: 1px solid var(--hairline);
    display: flex;
    align-items: center;
    gap: 10px;
`;

export const InputStyled = styled.input`
    flex: 1;
    padding: 12px 16px;
    background: var(--surface-2);
    border: 1px solid var(--hairline);
    border-radius: var(--r-pill);
    color: var(--ink);
    font-size: 14px;
`;

export const EmptyStyled = styled.div`
    color: var(--ink-muted);
    font-size: 13px;
    padding: 24px 0;
    text-align: center;
`;
