"use client";

import { useState } from "react";
import styled from "styled-components";

interface IProps {
	name?: string;
	size?: number;
	// A resolved (presigned / proxied) image URL. When present and loadable it
	// renders in place of the initials; a load error falls back to initials.
	src?: string;
}

const Wrap = styled.span<{ $size: number }>`
    width: ${(p) => p.$size}px;
    height: ${(p) => p.$size}px;
    font-size: ${(p) => p.$size * 0.42}px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--display);
    background: linear-gradient(135deg, var(--surface-3), var(--surface-2));
    color: var(--gold);
    border: 1px solid var(--hairline);
    overflow: hidden;
    flex-shrink: 0;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

export default function Avatar({ name = "?", size = 36, src }: IProps) {
	const [broken, setBroken] = useState(false);
	const initials = name.slice(0, 2).toUpperCase();
	const showImage = !!src && !broken;
	return (
		<Wrap $size={size}>
			{showImage ? (
				// Presigned URLs rotate, so next/image's optimiser cache is
				// counter-productive here — a plain <img> is correct.
				// biome-ignore lint/performance/noImgElement: rotating presigned URL
				<img
					src={src}
					alt={name}
					onError={() => setBroken(true)}
				/>
			) : (
				initials
			)}
		</Wrap>
	);
}
