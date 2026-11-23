"use client";

import type { ReactNode } from "react";
import styled from "styled-components";
import DemoRoleSwitcher from "@/components/DemoRoleSwitcher";

const Wrap = styled.main`
    min-height: 100vh;
    background: var(--bg);
    color: var(--ink);
`;

export default function Main({ children }: { children: ReactNode }) {
	return (
		<Wrap>
			{children}
			<DemoRoleSwitcher />
		</Wrap>
	);
}
