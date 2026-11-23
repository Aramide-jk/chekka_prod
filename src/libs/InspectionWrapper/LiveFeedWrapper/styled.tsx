"use client";

import styled from "styled-components";
import { Card } from "@/components";

export const GridStyled = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
    @media (max-width: 900px) { grid-template-columns: 1fr; }
`;
export const SectionStyled = styled(Card)`
    padding: 24px;

    .eyebrow-head { margin-bottom: 12px; }
    .inspector-name { font-size: 14px; }
    .inspector-elapsed {
        color: var(--ink-muted);
        font-size: 12px;
        margin-top: 4px;
    }
`;
export const StickyBarStyled = styled.div`
    position: sticky;
    top: 80px;
    z-index: 5;
    background: linear-gradient(180deg, var(--bg) 80%, transparent);
    padding: 12px 0 16px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;
export const NowStyled = styled.div`
    color: var(--gold-bright);
    font-family: var(--display);
    font-size: 20px;
`;
export const PhotoGridStyled = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    @media (max-width: 540px) { grid-template-columns: repeat(2, 1fr); }
`;
export const PhotoTileStyled = styled.div`
    position: relative;
    aspect-ratio: 4 / 3;
    background:
        radial-gradient(120% 90% at 50% 0%, rgba(201,169,97,0.10), transparent 60%),
        var(--surface-2);
    border: 1px solid var(--hairline);
    border-radius: var(--r-sm);
    display: grid;
    place-items: center;
    color: var(--ink-muted);
    overflow: hidden;
    animation: pop 0.3s ease both;
    @keyframes pop {
        from { transform: scale(0.92); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
`;
export const PhotoLabelStyled = styled.div`
    position: absolute;
    bottom: 6px;
    left: 6px;
    background: rgba(14,13,10,0.7);
    color: var(--ink-soft);
    font-size: 11px;
    padding: 4px 8px;
    border-radius: var(--r-pill);
    backdrop-filter: blur(8px);
`;
export const SideStyled = styled.div`display: flex; flex-direction: column; gap: 16px;`;
export const SectionListStyled = styled.div`display: flex; flex-direction: column; gap: 8px;`;
export const SectionRowStyled = styled.div<{ $on: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border-radius: var(--r-sm);
    background: ${(p) => (p.$on ? "var(--gold-wash)" : "transparent")};
    border: 1px solid ${(p) => (p.$on ? "var(--gold-wash-2)" : "var(--hairline)")};
    color: ${(p) => (p.$on ? "var(--gold-bright)" : "var(--ink-soft)")};
    font-size: 13px;
`;
export const EmptyStyled = styled.div`
    color: var(--ink-muted);
    font-size: 13px;
    padding: 36px 0;
    text-align: center;
`;
