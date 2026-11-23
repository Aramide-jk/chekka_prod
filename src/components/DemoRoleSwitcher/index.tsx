"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { DEMO_ACCOUNTS, type IDemoAccount, api } from "@/constants";
import { AppContextProvider } from "@/hooks";
import Icon from "../Icon";
import Pill from "../Pill";
import Spinner from "../Spinner";
import {
	ActiveDotStyled,
	FloatingPillStyled,
	PanelHeadStyled,
	PanelStyled,
	RoleItemStyled,
	RolesListStyled,
	SwitcherWrapStyled,
} from "./styled";

export default function DemoRoleSwitcher() {
	const { user, setUser } = useContext(AppContextProvider);
	const [isOpen, setIsOpen] = useState(false);
	const [switchingTo, setSwitchingTo] = useState<string | null>(null);
	const wrapRef = useRef<HTMLDivElement | null>(null);

	// Close on click outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}
		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [isOpen]);

	async function handleSwitchRole(account: IDemoAccount) {
		if (switchingTo) return;
		setSwitchingTo(account.role);

		try {
			const res = await api().post("/api/auth/login", {
				email: account.email,
				password: account.password,
			});
			const nextUser = res.data?.data?.user;
			if (nextUser) {
				setUser(nextUser);
			}
			window.location.assign(account.homePath);
		} catch (err) {
			console.error("Failed to switch demo role:", err);
			setSwitchingTo(null);
		}
	}

	const currentRoleLabel = user?.role
		? user.role.charAt(0).toUpperCase() + user.role.slice(1)
		: "Guest";

	return (
		<SwitcherWrapStyled ref={wrapRef} data-testid="demo-role-switcher">
			{isOpen && (
				<PanelStyled>
					<PanelHeadStyled>
						<div className="title-group">
							<div className="title">
								<Icon name="shield-check" size={14} />
								<span>Recruiter Demo Access</span>
							</div>
							<div className="sub">
								1-Click instant switch between roles
							</div>
						</div>
						<button
							type="button"
							className="close-btn"
							aria-label="Close demo switcher"
							onClick={() => setIsOpen(false)}
						>
							<Icon name="x" size={14} />
						</button>
					</PanelHeadStyled>

					<RolesListStyled>
						{DEMO_ACCOUNTS.map((acc) => {
							const isActive = user?.role === acc.role;
							const isBusy = switchingTo === acc.role;

							return (
								<RoleItemStyled
									key={acc.role}
									type="button"
									$isActive={isActive}
									$isBusy={isBusy}
									disabled={Boolean(switchingTo)}
									onClick={() => handleSwitchRole(acc)}
								>
									<div className="left">
										<div className="role-header">
											<span>{acc.label}</span>
											<Pill tone={isActive ? "gold" : "ghost"}>
												{acc.badge}
											</Pill>
										</div>
										<div className="role-desc">
											{acc.description}
										</div>
									</div>
									<div className="right">
										{isBusy ? (
											<Spinner size={16} />
										) : isActive ? (
											<ActiveDotStyled>Live</ActiveDotStyled>
										) : (
											<Icon
												name="chevron-right"
												size={14}
											/>
										)}
									</div>
								</RoleItemStyled>
							);
						})}
					</RolesListStyled>
				</PanelStyled>
			)}

			<FloatingPillStyled
				type="button"
				aria-label="Toggle demo role switcher"
				aria-expanded={isOpen}
				onClick={() => setIsOpen((prev) => !prev)}
			>
				<span className="bolt-icon">
					<Icon name="shield-check" size={14} />
				</span>
				<span>Demo Role:</span>
				<span className="role-tag">{currentRoleLabel}</span>
				<span className="chevron">
					<Icon name={isOpen ? "chevron-down" : "chevron-up"} size={12} />
				</span>
			</FloatingPillStyled>
		</SwitcherWrapStyled>
	);
}
