"use client";

import styled from "styled-components";
import { Card } from "@/components";

// ─── Header right slot (total + invite) ──────────────────────────────────────

export const HeaderActionsStyled = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: flex-end;
`;
export const TotalChipStyled = styled.span`
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    padding: 8px 14px;
    border-radius: var(--r-pill);
    background: var(--gold-wash);
    border: 1px solid var(--gold-wash-2);
    color: var(--gold-bright);
    font-family: var(--display);
`;
export const TotalNumberStyled = styled.span`
    font-size: 18px;
    line-height: 1;
`;
export const TotalLabelStyled = styled.span`
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--gold);
`;

// ─── Stats strip ─────────────────────────────────────────────────────────────

export const StatsRowStyled = styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 24px;
    @media (max-width: 720px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;
export const StatCardStyled = styled(Card)<{ $accent?: string }>`
    padding: 18px;
    position: relative;
    overflow: hidden;
    &::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: ${(p) => p.$accent ?? "var(--gold)"};
        opacity: 0.6;
    }
`;
export const StatHeadStyled = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
`;
export const StatLabelStyled = styled.div`
    color: var(--ink-muted);
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
`;
export const StatIconStyled = styled.span<{
	$tone: "gold" | "good" | "danger" | "info";
}>`
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    ${(p) => {
		switch (p.$tone) {
			case "gold":
				return `background: var(--gold-wash); color: var(--gold-bright);`;
			case "good":
				return `background: var(--good-wash); color: var(--good);`;
			case "danger":
				return `background: var(--danger-wash); color: var(--danger);`;
			default:
				return `background: var(--info-wash); color: var(--info);`;
		}
	}}
`;
export const StatValueStyled = styled.div`
    font-family: var(--display);
    font-size: 30px;
    line-height: 1;
`;
export const StatSubStyled = styled.span`
    font-size: 13px;
    color: var(--ink-muted);
    margin-left: 6px;
`;

// ─── Filter / search bar ─────────────────────────────────────────────────────

export const FilterBarStyled = styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 18px;
    flex-wrap: wrap;
`;
export const SearchBoxStyled = styled.div`
    position: relative;
    flex: 1;
    min-width: 240px;
    max-width: 420px;
    input {
        width: 100%;
        padding: 11px 16px 11px 40px;
        background: var(--surface-2);
        border: 1px solid var(--hairline);
        border-radius: var(--r-pill);
        color: var(--ink);
        font-size: 13px;
    }
    input:focus { outline: none; border-color: var(--gold); }
    svg {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--ink-muted);
    }
`;
export const FilterChipsStyled = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
`;
export const FilterChipStyled = styled.button<{ $on: boolean }>`
    font-family: inherit;
    cursor: pointer;
    padding: 7px 14px;
    border-radius: var(--r-pill);
    font-size: 12px;
    letter-spacing: 0.04em;
    background: ${(p) => (p.$on ? "var(--gold-wash)" : "transparent")};
    border: 1px solid
        ${(p) => (p.$on ? "var(--gold-wash-2)" : "var(--hairline)")};
    color: ${(p) => (p.$on ? "var(--gold-bright)" : "var(--ink-soft)")};
    transition: all 0.12s ease;
    &:hover {
        border-color: var(--gold);
        color: var(--gold-bright);
    }

    .chip-count {
        margin-left: 6px;
        color: var(--ink-faint);
    }
`;

// ─── Card grid ───────────────────────────────────────────────────────────────

export const GridStyled = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    @media (max-width: 1080px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    @media (max-width: 720px) { grid-template-columns: 1fr; }
`;
export const ManagerCardStyled = styled.button`
    text-align: left;
    font: inherit;
    cursor: pointer;
    padding: 20px;
    background: linear-gradient(180deg, var(--surface-2), var(--surface-1));
    border: 1px solid var(--hairline);
    border-radius: var(--r-md);
    display: flex;
    flex-direction: column;
    gap: 14px;
    transition: all 0.15s ease;
    width: 100%;
    &:hover {
        border-color: var(--gold);
        transform: translateY(-2px);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25),
            0 0 0 1px var(--gold-wash-2);
    }

    .perm-bar { margin-top: 8px; }
`;
export const CardHeadStyled = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;
export const CardNamesStyled = styled.div`
    flex: 1;
    min-width: 0;
    overflow: hidden;
`;
export const NameLineStyled = styled.div`
    font-family: var(--display);
    font-size: 17px;
    color: var(--ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;
export const EmailLineStyled = styled.div`
    color: var(--ink-muted);
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-top: 2px;
`;
export const PermCountStyled = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--ink-soft);
    font-size: 12px;
    margin-top: 2px;

    .perm-pct { color: var(--ink-muted); }
`;
export const BarStyled = styled.div`
    width: 100%;
    height: 4px;
    background: var(--surface-3);
    border-radius: 999px;
    overflow: hidden;
`;
export const BarFillStyled = styled.div<{ $pct: number }>`
    width: ${(p) => p.$pct}%;
    height: 100%;
    background: linear-gradient(90deg, var(--gold-bright), var(--gold));
    transition: width 0.2s ease;
`;
export const ChipRowStyled = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
`;
export const ChipStyled = styled.span`
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    background: var(--gold-wash);
    color: var(--gold-bright);
    border: 1px solid var(--gold-wash-2);
    border-radius: var(--r-pill);
    font-size: 11px;
    letter-spacing: 0.02em;
`;
export const MutedChipStyled = styled(ChipStyled)`
    background: transparent;
    color: var(--ink-muted);
    border-color: var(--hairline);
`;

// ─── Pagination ──────────────────────────────────────────────────────────────

export const PaginationBarStyled = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid var(--hairline);
    flex-wrap: wrap;

    .pg-gap {
        color: var(--ink-faint);
        padding: 0 4px;
        font-size: 12px;
    }

    .pg-num {
        display: inline-flex;
        gap: 6px;
    }
`;
export const PageInfoStyled = styled.div`
    color: var(--ink-muted);
    font-size: 12px;

    .pg-strong { color: var(--ink); }
`;
export const PageControlsStyled = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
`;
export const PageBtnStyled = styled.button<{
	$current?: boolean;
	$disabled?: boolean;
}>`
    font-family: inherit;
    cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
    opacity: ${(p) => (p.$disabled ? 0.4 : 1)};
    padding: 6px 11px;
    min-width: 34px;
    border-radius: var(--r-sm);
    font-size: 12px;
    background: ${(p) => (p.$current ? "var(--gold-wash)" : "transparent")};
    border: 1px solid
        ${(p) => (p.$current ? "var(--gold-wash-2)" : "var(--hairline)")};
    color: ${(p) => (p.$current ? "var(--gold-bright)" : "var(--ink-soft)")};
    display: inline-flex;
    align-items: center;
    gap: 4px;
    &:hover:not(:disabled) {
        border-color: var(--gold);
        color: var(--gold-bright);
    }
`;

export const EmptyStateStyled = styled(Card)`
    padding: 64px 24px;
    text-align: center;
    color: var(--ink-muted);

    .empty-cta { margin-top: 18px; }
`;
export const EmptyTitleStyled = styled.div`
    font-family: var(--display);
    font-size: 22px;
    color: var(--ink);
    margin: 12px 0 6px;
`;

// ─── Modal ───────────────────────────────────────────────────────────────────

export const BackdropStyled = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(10, 9, 7, 0.65);
    backdrop-filter: blur(6px);
    z-index: 50;
    display: grid;
    place-items: center;
    padding: 24px;
    animation: fade 0.18s ease both;
    @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
`;
export const ModalShellStyled = styled(Card)<{ $wide?: boolean }>`
    width: 100%;
    max-width: ${(p) => (p.$wide ? "720px" : "480px")};
    max-height: calc(100vh - 48px);
    overflow-y: auto;
    padding: 0;
    background: var(--surface-1);
    border: 1px solid var(--hairline-strong);
    animation: pop 0.18s ease both;
    @keyframes pop {
        from { transform: scale(0.96); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
`;
export const ModalHeadStyled = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 20px 24px;
    border-bottom: 1px solid var(--hairline);

    .modal-eyebrow { margin-bottom: 4px; }

    .head-id {
        display: flex;
        align-items: center;
        gap: 14px;
    }

    .head-email {
        color: var(--ink-muted);
        font-size: 12px;
        margin-top: 4px;
    }

    .head-status {
        display: flex;
        align-items: center;
        gap: 10px;
    }
`;
export const ModalTitleStyled = styled.h2`
    font-family: var(--display);
    font-size: 22px;
    margin: 0;
`;
export const CloseButtonStyled = styled.button`
    background: transparent;
    border: 1px solid transparent;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    color: var(--ink-muted);
    cursor: pointer;
    &:hover {
        color: var(--ink);
        background: var(--surface-2);
        border-color: var(--hairline);
    }
`;
export const ModalBodyStyled = styled.div`
    padding: 20px 24px;

    .pending-banner {
        margin-bottom: 18px;
        padding: 12px 14px;
        background: var(--caution-wash);
        border: 1px solid var(--caution-deep);
        border-radius: var(--r-sm);
        color: var(--caution);
        font-size: 13px;
    }

    .reissued-box {
        margin-bottom: 18px;
        padding: 12px;
        background: var(--surface-2);
        border: 1px solid var(--hairline);
        border-radius: var(--r-sm);
    }

    .reissued-copy {
        display: flex;
        justify-content: flex-end;
        margin-top: 8px;
    }
`;
export const ModalFooterStyled = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 16px 24px;
    border-top: 1px solid var(--hairline);
    flex-wrap: wrap;
`;
export const ModalFooterRightStyled = styled.div`
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
`;
export const FieldStyled = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 14px;
`;
export const FieldLabelStyled = styled.label`
    font-size: 12px;
    color: var(--ink-muted);
`;
export const InputStyled = styled.input`
    padding: 10px 14px;
    background: var(--surface-2);
    border: 1px solid var(--hairline);
    border-radius: var(--r-sm);
    color: var(--ink);
    font-size: 13px;
    &:focus { outline: none; border-color: var(--gold); }
`;
export const PermGroupStyled = styled.div`
    & + & {
        margin-top: 18px;
        padding-top: 18px;
        border-top: 1px solid var(--hairline);
    }
`;
export const PermGroupHeadStyled = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 10px;
`;
export const PermGroupTitleStyled = styled.div`
    font-family: var(--display);
    font-size: 14px;
    color: var(--ink);
`;
export const PermGroupHintStyled = styled.div`
    color: var(--ink-muted);
    font-size: 11px;
`;
export const PermissionRowStyled = styled.label`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 14px;
    background: var(--surface-2);
    border: 1px solid var(--hairline);
    border-radius: var(--r-sm);
    cursor: pointer;
    font-size: 13px;
    & + & { margin-top: 6px; }
    &:hover { border-color: var(--gold); }

    &.locked {
        opacity: 0.55;
        cursor: not-allowed;
    }
`;
export const ToggleStyled = styled.input.attrs({ type: "checkbox" })`
    accent-color: var(--gold-bright);
    width: 16px;
    height: 16px;
`;
export const ErrorBoxStyled = styled.div`
    margin-top: 12px;
    padding: 10px 14px;
    background: var(--danger-wash);
    border: 1px solid var(--danger-deep);
    border-radius: var(--r-sm);
    color: var(--danger);
    font-size: 13px;
`;
export const DirtyStatusStyled = styled.div`
    color: var(--ink-muted);
    font-size: 12px;

    &.spaced-below { margin-bottom: 12px; }
    &.spaced-below-sm { margin-bottom: 8px; }
    &.spaced-above-sm { margin-top: 10px; }
`;

export const FullWidthInputStyled = styled(InputStyled)`
    width: 100%;
`;
