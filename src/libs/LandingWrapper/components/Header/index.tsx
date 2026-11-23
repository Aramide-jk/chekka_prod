"use client";

import Link from "next/link";
import { useContext } from "react";
import { Avatar, Button, Logo, Pill } from "@/components";
import { AppContextProvider } from "@/hooks";
import type { UserRole } from "@/types";
import {
	BarStyled,
	CTAsStyled,
	HideOnMobileStyled,
	InnerStyled,
	NavListStyled,
} from "./styled";

const ROLE_HOME: Record<UserRole, string> = {
	buyer: "/dashboard",
	inspector: "/inspector/dashboard",
	consultant: "/consultant/chats",
	admin: "/admin",
	manager: "/admin",
};

const ROLE_LABEL: Record<UserRole, string> = {
	buyer: "Buyer",
	inspector: "Inspector",
	consultant: "Consultant",
	admin: "Admin",
	manager: "Manager",
};

export default function Header() {
	const { user, isUserLoggedIn } = useContext(AppContextProvider);
	const dashboardHref = user ? ROLE_HOME[user.role] : "/dashboard";
	const showBookButton = !isUserLoggedIn || user?.role === "buyer";

	return (
		<BarStyled>
			<InnerStyled>
				<Link href={isUserLoggedIn ? dashboardHref : "/"} aria-label="Home">
					<Logo />
				</Link>
				<NavListStyled>
					<a href="#how">How it works</a>
					<a href="#plans">Plans</a>
					<a href="#trust">Trust</a>
					<a href="#brokers">Brokers</a>
					<a href="#inspectors">Become an inspector</a>
				</NavListStyled>
				<CTAsStyled>
					{isUserLoggedIn && user ? (
						<>
							<HideOnMobileStyled>
								<Pill tone="ghost">
									{ROLE_LABEL[user.role]}
								</Pill>
							</HideOnMobileStyled>
							<HideOnMobileStyled>
								<Link href={dashboardHref}>
									<Button variant="ghost" size="sm">
										Dashboard
									</Button>
								</Link>
							</HideOnMobileStyled>
							<Link
								href={dashboardHref}
								aria-label={`Open ${user.fullName}'s dashboard`}
							>
								<Avatar name={user.fullName} size={36} />
							</Link>
						</>
					) : (
						<HideOnMobileStyled>
							<Link href="/login">
								<Button variant="ghost" size="sm">
									Sign in
								</Button>
							</Link>
						</HideOnMobileStyled>
					)}
					{showBookButton && (
						<Link href="/book">
							<Button variant="primary" size="sm">
								Book inspection
							</Button>
						</Link>
					)}
				</CTAsStyled>
			</InnerStyled>
		</BarStyled>
	);
}
