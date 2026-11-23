"use client";

import styled from "styled-components";
import { Card } from "@/components";

export const StackStyled = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 720px;
`;

export const BlockStyled = styled(Card)`
    padding: 24px;
`;

export const HStyled = styled.h2`
    font-family: var(--display);
    font-size: 22px;
    margin: 0 0 10px;
`;

export const PStyled = styled.p`
    color: var(--ink-soft);
    line-height: 1.65;
    font-size: 14px;
`;
