"use client";

import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/components";

interface IChecklistItem {
	status: "good" | "minor" | "serious" | "n/a";
}

export const ActionsStyled = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;

    .share-msg {
        font-size: 12px;
        color: var(--ink-muted);
        flex-basis: 100%;
        text-align: right;
    }
`;

export const ReportHeaderStyled = styled(Card)`
    padding: 24px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;

    .ins-avatar {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: var(--surface-2);
        border: 1px solid var(--hairline);
        display: grid;
        place-items: center;
        font-family: var(--display);
        font-size: 20px;
        color: var(--gold-bright);
        overflow: hidden;
        flex: 0 0 auto;
    }
    .ins-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .ins-head { flex: 1; min-width: 200px; }
    .ins-title {
        font-family: var(--display);
        font-size: 12px;
        color: var(--ink-muted);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin-bottom: 4px;
    }
    .ins-name { font-size: 18px; margin-bottom: 4px; }
    .ins-meta { font-size: 12px; color: var(--ink-muted); }
`;

export const BadgeStyled = styled.span<{ $certified?: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: var(--r-pill);
    font-size: 11px;
    white-space: nowrap;
    background: ${(p) => (p.$certified ? "var(--gold-wash)" : "var(--good-wash)")};
    border: 1px solid ${(p) => (p.$certified ? "var(--gold-wash-2)" : "var(--good-deep)")};
    color: ${(p) => (p.$certified ? "var(--gold-bright)" : "var(--good)")};
`;

export const PhotoButtonStyled = styled.button`
    aspect-ratio: 4 / 3;
    background:
        radial-gradient(120% 90% at 50% 0%, rgba(201,169,97,0.10), transparent 60%),
        var(--surface-2);
    border: 1px solid var(--hairline);
    border-radius: var(--r-sm);
    display: grid;
    place-items: center;
    color: var(--ink-muted);
    padding: 0;
    overflow: hidden;
    cursor: pointer;
    img { width: 100%; height: 100%; object-fit: cover; display: block; }
    &:hover { border-color: var(--gold-wash-2); }
`;

export const LightboxStyled = styled.div`
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(8, 8, 6, 0.85);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;

    img {
        max-width: 92vw;
        max-height: 86vh;
        object-fit: contain;
        border-radius: var(--r-sm);
    }
    .lb-caption {
        position: absolute;
        bottom: 50px;
        left: 20px;
        right: 20px;
        text-align: center;
        color: var(--ink);
        font-size: 13px;
        font-weight: 500;
        text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
        background: rgba(18, 18, 16, 0.75);
        border: 1px solid var(--hairline);
        padding: 6px 16px;
        border-radius: var(--r-pill);
        display: inline-block;
        width: fit-content;
        margin: 0 auto;
        backdrop-filter: blur(4px);
    }
    .lb-count {
        position: absolute;
        bottom: 20px;
        left: 0;
        right: 0;
        text-align: center;
        color: var(--ink-muted);
        font-size: 13px;
    }
    button {
        position: absolute;
        background: rgba(0, 0, 0, 0.45);
        border: 1px solid var(--hairline-strong);
        color: var(--ink);
        border-radius: var(--r-pill);
        width: 40px;
        height: 40px;
        display: grid;
        place-items: center;
        cursor: pointer;
    }
    button:hover { background: rgba(0, 0, 0, 0.65); }
    .lb-close { top: 18px; right: 18px; }
    .lb-prev { top: 50%; left: 18px; transform: translateY(-50%); }
    .lb-next { top: 50%; right: 18px; transform: translateY(-50%); }
`;

export const TabsStyled = styled.div`
    display: flex;
    gap: 4px;
    overflow-x: auto;
    border-bottom: 1px solid var(--hairline);
    margin-bottom: 32px;
`;
export const TabStyled = styled.button<{ $on: boolean }>`
    padding: 14px 18px;
    background: transparent;
    color: ${(p) => (p.$on ? "var(--gold-bright)" : "var(--ink-muted)")};
    border: none;
    border-bottom: 2px solid ${(p) => (p.$on ? "var(--gold)" : "transparent")};
    font-size: 13px;
    cursor: pointer;
    white-space: nowrap;
    &:hover { color: var(--ink); }
`;
export const LifecycleStyled = styled(Card)`
    padding: 24px;
    margin-bottom: 24px;

    .lifecycle-label { margin-bottom: 12px; }
    .lifecycle-live { margin-top: 14px; }
`;
export const StageRowStyled = styled.div`display: flex; align-items: center; gap: 8px; flex-wrap: wrap;`;
export const StageStyled = styled.div<{ $on: boolean; $done: boolean }>`
    padding: 8px 14px;
    border-radius: var(--r-pill);
    background: ${(p) => (p.$on ? "var(--gold-wash)" : p.$done ? "var(--surface-2)" : "transparent")};
    border: 1px solid ${(p) => (p.$on || p.$done ? "var(--gold-wash-2)" : "var(--hairline)")};
    color: ${(p) => (p.$on ? "var(--gold-bright)" : p.$done ? "var(--ink)" : "var(--ink-muted)")};
    font-size: 12px;
`;
export const GridStyled = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
    @media (max-width: 900px) { grid-template-columns: 1fr; }
`;
export const ColumnStyled = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;
export const SectionStyled = styled(Card)`
    padding: 28px;

    .muted-note {
        color: var(--ink-muted);
        font-size: 13px;
    }
    .img-cover {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .inspector-label { margin-bottom: 12px; }
    .inspector-name { font-size: 16px; margin-bottom: 6px; }
    .inspector-sub { color: var(--ink-muted); font-size: 12px; }
    .rating-block { margin-top: 16px; }
    .rating-heading {
        font-size: 12px;
        color: var(--ink-muted);
        margin-bottom: 6px;
    }
    .rating-heading-pick {
        font-size: 12px;
        color: var(--ink-muted);
        margin-bottom: 8px;
    }
    .rating-comment {
        font-size: 13px;
        color: var(--ink-soft);
        margin-top: 8px;
    }
    .rating-input {
        width: 100%;
        margin-top: 10px;
        padding: 9px 11px;
        background: var(--surface-2);
        border: 1px solid var(--hairline-strong);
        border-radius: var(--r-sm);
        color: var(--ink);
        font-family: var(--sans);
        font-size: 13px;
    }
    .rating-error {
        color: var(--danger);
        font-size: 12px;
        margin: 8px 0;
    }
    .rating-submit { margin-top: 10px; }
    .next-steps-label { margin-bottom: 12px; }
    .next-steps {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
`;
export const SectionTitleStyled = styled.h2`
    font-family: var(--display);
    font-size: 24px;
    margin: 0 0 18px;
`;
export const SpecStyled = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0 32px;
    @media (max-width: 540px) { grid-template-columns: 1fr; }
`;
export const SpecRowStyled = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid var(--hairline);
    font-size: 13px;
    span:first-child { color: var(--ink-muted); }
    span:last-child { color: var(--ink); }
`;
export const CountsStyled = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-top: 16px;
`;
export const CountStyled = styled.div<{ $tone: "good" | "caution" | "danger" }>`
    padding: 18px;
    border-radius: var(--r-md);
    background: ${(p) => `var(--${p.$tone}-wash)`};
    border: 1px solid ${(p) => `var(--${p.$tone}-deep)`};
    color: ${(p) => `var(--${p.$tone})`};

    .count-label { color: ${(p) => `var(--${p.$tone})`}; }
    .count-num {
        font-family: var(--display);
        font-size: 36px;
        margin-top: 6px;
    }
`;
export const VerdictStyled = styled.div<{
	$tone: "good" | "caution" | "danger";
}>`
    padding: 32px;
    border-radius: var(--r-md);
    background: ${(p) => `var(--${p.$tone}-wash)`};
    border: 1px solid ${(p) => `var(--${p.$tone}-deep)`};
    text-align: center;

    .verdict-label { color: ${(p) => `var(--${p.$tone})`}; }
    .verdict-written {
        color: var(--ink-soft);
        font-size: 14px;
        max-width: 540px;
        margin: 0 auto;
        line-height: 1.6;
    }
`;
export const VerdictTitleStyled = styled.div<{
	$tone: "good" | "caution" | "danger";
}>`
    font-family: var(--display);
    font-size: 44px;
    color: ${(p) => `var(--${p.$tone})`};
    margin: 8px 0 12px;
`;
export const ChecklistGridStyled = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    @media (max-width: 540px) { grid-template-columns: 1fr; }
`;
export const CheckStyled = styled.div<{ $status: IChecklistItem["status"] }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-radius: var(--r-sm);
    background: ${(p) =>
		p.$status === "good"
			? "var(--surface-2)"
			: p.$status === "minor"
				? "var(--caution-wash)"
				: p.$status === "serious"
					? "var(--danger-wash)"
					: "var(--surface)"};
    border: 1px solid ${(p) =>
		p.$status === "good"
			? "var(--hairline)"
			: p.$status === "minor"
				? "var(--caution-deep)"
				: p.$status === "serious"
					? "var(--danger-deep)"
					: "var(--hairline)"};
    font-size: 13px;
`;
export const PhotoGridStyled = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    @media (max-width: 720px) { grid-template-columns: repeat(2, 1fr); }
`;
export const PhotoTileStyled = styled.div`
    aspect-ratio: 4 / 3;
    background:
        radial-gradient(120% 90% at 50% 0%, rgba(201,169,97,0.10), transparent 60%),
        var(--surface-2);
    border: 1px solid var(--hairline);
    border-radius: var(--r-sm);
    display: grid;
    place-items: center;
    color: var(--ink-muted);
`;

export const StarPickStyled = styled.div`
    display: flex;
    gap: 4px;
    button {
        background: none;
        border: none;
        padding: 2px;
        cursor: pointer;
        color: var(--gold-bright);
        display: inline-flex;
    }
    button:hover { color: var(--gold); }
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
    max-width: 520px;
    padding: 28px;
    max-height: 90vh;
    overflow-y: auto;

    .modal-label { margin-bottom: 4px; }
    .modal-actions {
        display: flex;
        gap: 10px;
    }
`;
export const ModalLinkStyled = styled(Link)`flex: 1;`;
export const BrokerCopyStyled = styled.p`
    color: var(--ink-soft);
    font-size: 14px;
    line-height: 1.6;
    margin: 12px 0 20px;
`;
export const FieldLabelStyled = styled.label`
    display: block;
    margin-bottom: 14px;
    span {
        display: block;
        color: var(--ink-soft);
        font-size: 12px;
        margin-bottom: 6px;
    }
    input, textarea {
        width: 100%;
        padding: 11px 13px;
        background: var(--surface-2);
        border: 1px solid var(--hairline-strong);
        border-radius: var(--r-sm);
        color: var(--ink);
        font-family: var(--sans);
        font-size: 14px;
    }
`;
export const ModalErrorStyled = styled.div`
    padding: 9px 13px;
    background: var(--danger-wash);
    border: 1px solid var(--danger-deep);
    border-radius: var(--r-sm);
    color: var(--danger);
    font-size: 13px;
    margin-bottom: 14px;
`;
