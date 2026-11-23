"use client";

import Link from "next/link";
import { Logo } from "@/components";
import {
	BottomStyled,
	BrandStyled,
	EyebrowStyled,
	InnerStyled,
	StackStyled,
	WrapStyled,
} from "./styled";

interface FooterLink {
	label: string;
	href: string;
}

interface Column {
	t: string;
	l: FooterLink[];
}

const COLUMNS: Column[] = [
	{
		t: "Product",
		l: [
			{ label: "Book inspection", href: "/book" },
			{ label: "Plans", href: "/#plans" },
			{ label: "Sample report", href: "/sample-report" },
			{ label: "Broker service", href: "/#brokers" },
		],
	},
	{
		t: "For pros",
		l: [
			{ label: "Become an inspector", href: "/inspector/apply" },
			{ label: "Inspector dashboard", href: "/inspector/dashboard" },
			{ label: "Earnings", href: "/inspector/earnings" },
			{ label: "Certifications", href: "/#inspectors" },
		],
	},
	{
		t: "Company",
		l: [
			{ label: "About", href: "/#trust" },
			{ label: "Press", href: "/#trust" },
			{ label: "Privacy", href: "/privacy" },
			{ label: "Terms", href: "/terms" },
		],
	},
];

export default function Footer() {
	return (
		<WrapStyled>
			<InnerStyled>
				<div>
					<Logo />
					<BrandStyled>
						Nigeria's professional car inspection and verification
						platform. Before you buy — Chekka.
					</BrandStyled>
				</div>
				{COLUMNS.map((c) => (
					<div key={c.t}>
						<EyebrowStyled>{c.t}</EyebrowStyled>
						<StackStyled>
							{c.l.map((x) => (
								<Link key={x.label} href={x.href}>
									{x.label}
								</Link>
							))}
						</StackStyled>
					</div>
				))}
			</InnerStyled>
			<BottomStyled>
				<span>© 2026 Chekka Technologies Ltd. Lagos · Nigeria.</span>
				<span>Made with rigor in West Africa.</span>
			</BottomStyled>
		</WrapStyled>
	);
}
