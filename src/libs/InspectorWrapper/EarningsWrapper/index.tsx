"use client";

import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { Button, Eyebrow, Icon, Pill } from "@/components";
import { NIGERIAN_BANKS, fetcher } from "@/constants";
import { PageShell } from "@/layouts";
import type { IResponseEnvelope } from "@/types";
import {
	BankCardStyled,
	EmptyStyled,
	GridStyled,
	RowStyled,
	SectionStyled,
	StatStyled,
	ValueStyled,
} from "./styled";

interface ITransaction {
	_id: string;
	inspectionId?: string;
	amount: number;
	platformFee: number;
	inspectorPayableAmountMinor?: number;
	status: string;
	payoutStatus: "not_eligible" | "held" | "held_dispute" | "eligible" | "action_required" | "processing" | "failed" | "manual_attention" | "released" | "refunded";
	createdAt: string;
}

interface IEarnings {
	aggregate: { released: number; held: number; totalCount: number };
	transactions: ITransaction[];
}

interface IProfileData {
	profile: {
		payoutAccount?: {
			bankCode?: string;
			accountNumber?: string;
			accountName?: string;
			status?: "pending" | "verified" | "invalid";
		};
	};
}

const TONE: Record<string, "good" | "gold" | "caution" | "ghost"> = {
	released: "good",
	held: "gold",
	held_dispute: "caution",
	not_eligible: "ghost",
	eligible: "gold",
	action_required: "caution",
	processing: "gold",
	failed: "caution",
	manual_attention: "caution",
	refunded: "ghost",
};

const BANK_STATUS_TONE: Record<string, "good" | "gold" | "caution"> = {
	verified: "good",
	pending: "gold",
	invalid: "caution",
};

export default function EarningsWrapper() {
	const [hide, setHide] = useState(true);
	const { data } = useSWR<IResponseEnvelope<IEarnings>>(
		"/api/transactions/earnings",
		fetcher,
		{ revalidateOnMount: true },
	);
	const { data: profileRes } = useSWR<IResponseEnvelope<IProfileData>>(
		"/api/inspector-profiles/me",
		fetcher,
		{ revalidateOnMount: true },
	);

	const payoutAccount = profileRes?.data?.profile?.payoutAccount;
	const hasBankAccount = Boolean(payoutAccount?.accountNumber);
	const bankName = payoutAccount?.bankCode
		? NIGERIAN_BANKS.find((b) => b.value === payoutAccount.bankCode)?.label ??
		  `Bank (${payoutAccount.bankCode})`
		: "Bank";

	const aggregate = data?.data?.aggregate ?? {
		released: 0,
		held: 0,
		totalCount: 0,
	};
	const txs = data?.data?.transactions ?? [];

	const released = aggregate.released;
	const held = aggregate.held;
	const lifetime = released + held;

	return (
		<PageShell
			eyebrow="Earnings"
			title="Your"
			titleEm="payouts"
			navTitle="Earnings"
			subtitle="Held for 48 hours after report submission. Released automatically if there are no disputes."
			right={
				<Button
					variant="ghost"
					size="sm"
					icon={hide ? "eye" : "eye-off"}
					onClick={() => setHide(!hide)}
				>
					{hide ? "Reveal" : "Hide"} amounts
				</Button>
			}
		>
			<GridStyled>
				<StatStyled $blur={hide}>
					<Eyebrow $gold>Released</Eyebrow>
					<ValueStyled>₦{released.toLocaleString()}</ValueStyled>
				</StatStyled>
				<StatStyled $blur={hide}>
					<Eyebrow $gold>Held</Eyebrow>
					<ValueStyled>₦{held.toLocaleString()}</ValueStyled>
				</StatStyled>
				<StatStyled $blur={hide}>
					<Eyebrow $gold>Lifetime</Eyebrow>
					<ValueStyled>₦{lifetime.toLocaleString()}</ValueStyled>
				</StatStyled>
			</GridStyled>

			{hasBankAccount ? (
				<BankCardStyled data-testid="payout-bank-card">
					<div className="bank-left">
						<div className="bank-icon">
							<Icon name="check" size={20} />
						</div>
						<div className="bank-details">
							<div className="bank-title">
								<span>Payout Bank: {bankName}</span>
								<Pill tone={BANK_STATUS_TONE[payoutAccount?.status ?? "pending"] ?? "gold"}>
									{payoutAccount?.status ?? "pending"}
								</Pill>
							</div>
							<div className="bank-sub">
								{payoutAccount?.accountName} • •••• {payoutAccount?.accountNumber?.slice(-4)}
							</div>
						</div>
					</div>
					<Link href="/settings">
						<Button variant="ghost" size="sm" icon="settings">
							Settings
						</Button>
					</Link>
				</BankCardStyled>
			) : (
				<BankCardStyled $warning data-testid="payout-bank-warning">
					<div className="bank-left">
						<div className="bank-icon">
							<Icon name="warning" size={20} />
						</div>
						<div className="bank-details">
							<div className="bank-title">
								<span>No payout account linked</span>
								<Pill tone="caution">Action required</Pill>
							</div>
							<div className="bank-sub">
								Connect your Nigerian bank account to automatically receive your earnings once clearance periods end.
							</div>
						</div>
					</div>
					<Link href="/settings">
						<Button variant="primary" size="sm" icon="plus">
							Connect Bank Account
						</Button>
					</Link>
				</BankCardStyled>
			)}

			<SectionStyled data-testid="payouts-table">
				<Eyebrow $gold className="eyebrow">
					Recent payouts ({txs.length})
				</Eyebrow>
				{txs.length === 0 && <EmptyStyled>No payouts yet.</EmptyStyled>}
				{txs.map((t) => (
					<RowStyled key={t._id}>
						<div className="tx-label">
							<Icon name="car" size={16} />
							<span>Inspection</span>
						</div>
						<div className="tx-date">
							{new Date(t.createdAt).toLocaleDateString()}
						</div>
						<div className={hide ? "tx-amount blurred" : "tx-amount"}>
							₦{(
								(t.inspectorPayableAmountMinor ??
									(t.amount - t.platformFee) * 100) / 100
							).toLocaleString()}
						</div>
						<Pill tone={TONE[t.payoutStatus] ?? "ghost"}>
							{t.payoutStatus}
						</Pill>
					</RowStyled>
				))}
			</SectionStyled>
		</PageShell>
	);
}
