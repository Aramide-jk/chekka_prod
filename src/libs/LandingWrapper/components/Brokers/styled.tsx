"use client";

import styled from "styled-components";
import { Eyebrow } from "@/components";

export const SectionStyled = styled.section`
    padding: 120px 32px;
    max-width: 1280px;
    margin: 0 auto;
`;

export const GridStyled = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
        gap: 60px;
    }
`;

export const ChatCardStyled = styled.div`
    padding: 40px;
    background: linear-gradient(140deg, var(--surface-2) 0%, var(--bg-tint) 100%);
    border: 1px solid var(--hairline);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-2);
`;

export const HeaderStyled = styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 28px;

    .name { font-size: 15px; font-weight: 500; }
    .meta { color: var(--ink-muted); font-size: 12px; }
    .live { margin-left: auto; }
`;

export const MessagesStyled = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const BubbleStyled = styled.div<{ $from: "broker" | "buyer" }>`
    background: ${(p) =>
		p.$from === "broker" ? "var(--surface)" : "var(--gold-wash-2)"};
    padding: 14px;
    border-radius: 14px;
    font-size: 13px;
    color: ${(p) => (p.$from === "broker" ? "var(--ink-soft)" : "var(--ink)")};
    max-width: 85%;
    ${(p) => p.$from === "buyer" && "margin-left: auto;"}
`;

export const EyebrowStyled = styled(Eyebrow)`
    margin-bottom: 16px;
`;

export const TitleStyled = styled.h2`
    font-family: var(--display);
    font-size: 56px;
    line-height: 1;
    margin: 0 0 24px;
    letter-spacing: -0.02em;

    em {
        font-style: italic;
        color: var(--gold-bright);
    }
`;

export const LedeStyled = styled.p`
    color: var(--ink-soft);
    font-size: 16px;
    margin-bottom: 32px;
    max-width: 480px;
`;
