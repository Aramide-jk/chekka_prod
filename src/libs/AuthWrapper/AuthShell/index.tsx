"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Eyebrow, Logo } from "@/components";
import {
	CanvasStyled,
	FooterStyled,
	FormStyled,
	LeftStyled,
	QuoteStyled,
	RightStyled,
	SubtitleStyled,
	TitleStyled,
} from "./styled";

interface IProps {
	eyebrow: string;
	title: string;
	titleEm?: string;
	subtitle: string;
	footer?: ReactNode;
	children: ReactNode;
}

export default function AuthShell({
	eyebrow,
	title,
	titleEm,
	subtitle,
	footer,
	children,
}: IProps) {
	return (
		<CanvasStyled>
			<LeftStyled>
				<Link href="/">
					<Logo />
				</Link>
				<QuoteStyled>
					<blockquote>
						Before you buy — <em>Chekka</em>.
					</blockquote>
					<cite>Nigeria's certified inspection platform</cite>
				</QuoteStyled>
				<div className="copyright">
					© 2026 Chekka Technologies Ltd. Lagos · Nigeria.
				</div>
			</LeftStyled>
			<RightStyled>
				<FormStyled>
					<Eyebrow $gold>{eyebrow}</Eyebrow>
					<TitleStyled>
						{title}
						{titleEm && (
							<>
								{" "}
								<em>{titleEm}</em>
							</>
						)}
					</TitleStyled>
					<SubtitleStyled>{subtitle}</SubtitleStyled>
					{children}
					{footer && <FooterStyled>{footer}</FooterStyled>}
				</FormStyled>
			</RightStyled>
		</CanvasStyled>
	);
}
