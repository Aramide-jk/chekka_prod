"use client";

import {
	type FormEvent,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import useSWR from "swr";
import { Avatar, Button, Eyebrow, Pill, Select } from "@/components";
import { api, fetcher, getErrorMessage } from "@/constants";
import { AppContextProvider } from "@/hooks";
import { PageShell } from "@/layouts";
import type { IResponseEnvelope } from "@/types";
import {
	BubbleStyled,
	ChatHeadStyled,
	ChatPaneStyled,
	ComposerStyled,
	ContactInfoStyled,
	ContactMetaStyled,
	ContactNameStyled,
	ContactRowStyled,
	EmptyStyled,
	GridStyled,
	InputStyled,
	MessagesStyled,
	PanelStyled,
	RecoCardStyled,
	SidebarStyled,
	SystemLineStyled,
	TabStyled,
	TabsStyled,
} from "./styled";

const TABS = ["Pending", "Active", "Escalated"] as const;
type TabKey = (typeof TABS)[number];

interface IChat {
	_id: string;
	chatType: "consultant" | "broker";
	status: string;
	escalatedTo?: string | null;
	lastMessage?: string;
	lastMessageAt: string;
	buyerId: string;
	counterpartyId?: string | null;
}

interface IRecommendation {
	inspectionType: string;
	price: number;
	description: string;
	ctaLink?: string;
}

interface IMessage {
	_id: string;
	chatId: string;
	senderId: string;
	kind: string;
	body: string;
	recommendation?: IRecommendation;
	createdAt: string;
}

function naira(n: number) {
	return `₦${Number(n || 0).toLocaleString("en-NG")}`;
}

export default function ConsultantWrapper() {
	const { user } = useContext(AppContextProvider);
	const myId = user?.id;
	const [tab, setTab] = useState<TabKey>("Pending");
	const [selected, setSelected] = useState<string | null>(null);
	const [text, setText] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [showReco, setShowReco] = useState(false);
	const [reco, setReco] = useState({
		inspectionType: "standard",
		price: "",
		description: "",
	});

	const { data: chatsData, mutate: refreshChats } = useSWR<
		IResponseEnvelope<{ chats: IChat[] }>
	>("/api/chats", fetcher, {
		revalidateOnMount: true,
		refreshInterval: 10_000,
	});
	const chats = useMemo(() => chatsData?.data?.chats ?? [], [chatsData]);

	const byTab = useMemo(
		() => ({
			Pending: chats.filter((c) => c.status === "pending"),
			Active: chats.filter(
				(c) => c.status === "active" && !c.escalatedTo,
			),
			Escalated: chats.filter((c) => !!c.escalatedTo),
		}),
		[chats],
	);
	const rows = byTab[tab];

	useEffect(() => {
		if (selected && !chats.find((c) => c._id === selected)) {
			setSelected(null);
		}
	}, [chats, selected]);

	const { data: messageData, mutate: refreshMessages } = useSWR<
		IResponseEnvelope<{ messages: IMessage[]; chat: IChat }>
	>(selected ? `/api/chats/${selected}/messages` : null, fetcher, {
		revalidateOnMount: true,
		refreshInterval: 5_000,
	});
	const messages = messageData?.data?.messages ?? [];
	const activeChat = messageData?.data?.chat;

	async function send(e: FormEvent) {
		e.preventDefault();
		if (!selected || !text.trim() || busy) return;
		setBusy(true);
		setError(null);
		try {
			await api().post(`/api/chats/${selected}/messages`, { body: text });
			setText("");
			await refreshMessages();
			await refreshChats();
		} catch (err) {
			setError(getErrorMessage(err, "Could not send"));
		} finally {
			setBusy(false);
		}
	}

	async function sendRecommendation() {
		if (!selected || busy) return;
		const price = Number(reco.price.replace(/[^0-9]/g, ""));
		if (!reco.description.trim()) {
			setError("Add a short description for the recommendation.");
			return;
		}
		setBusy(true);
		setError(null);
		try {
			await api().post(`/api/chats/${selected}/messages`, {
				body: reco.description.trim(),
				kind: "recommendation",
				recommendation: {
					inspectionType: reco.inspectionType,
					price,
					description: reco.description.trim(),
					ctaLink: `/book?type=${reco.inspectionType}`,
				},
			});
			setShowReco(false);
			setReco({ inspectionType: "standard", price: "", description: "" });
			await refreshMessages();
		} catch (err) {
			setError(getErrorMessage(err, "Could not send recommendation"));
		} finally {
			setBusy(false);
		}
	}

	async function escalate() {
		if (!selected || busy) return;
		const reason = window.prompt(
			"Escalate this chat to admin. Reason?",
			"",
		);
		if (!reason?.trim()) return;
		setBusy(true);
		setError(null);
		try {
			await api().post(`/api/chats/${selected}/escalate`, {
				reason: reason.trim(),
			});
			await refreshMessages();
			await refreshChats();
		} catch (err) {
			setError(getErrorMessage(err, "Could not escalate"));
		} finally {
			setBusy(false);
		}
	}

	return (
		<PageShell
			eyebrow="Consultant"
			title="Conversations"
			titleEm="in flight"
			navTitle="Consultant"
			subtitle="Guide buyers before they book — recommend a plan, escalate if needed."
			right={
				<Pill tone="gold" dot>
					You're online
				</Pill>
			}
		>
			<GridStyled>
				<SidebarStyled>
					<TabsStyled data-testid="consultant-tabs">
						{TABS.map((t) => (
							<TabStyled
								key={t}
								$on={tab === t}
								onClick={() => setTab(t)}
								type="button"
							>
								{t} ({byTab[t].length})
							</TabStyled>
						))}
					</TabsStyled>
					{rows.length === 0 && (
						<EmptyStyled>Nothing here right now.</EmptyStyled>
					)}
					{rows.map((c) => (
						<ContactRowStyled
							key={c._id}
							$on={selected === c._id}
							onClick={() => setSelected(c._id)}
						>
							<Avatar
								name={`Buyer ${c.buyerId.slice(-4)}`}
								size={40}
							/>
							<ContactInfoStyled>
								<ContactNameStyled>
									Buyer · {c.buyerId.slice(-6)}
								</ContactNameStyled>
								<ContactMetaStyled>
									{c.lastMessage ?? "No messages yet"}
								</ContactMetaStyled>
							</ContactInfoStyled>
						</ContactRowStyled>
					))}
				</SidebarStyled>

				<ChatPaneStyled>
					{!selected ? (
						<MessagesStyled>
							<EmptyStyled>
								Select a conversation to view it.
							</EmptyStyled>
						</MessagesStyled>
					) : (
						<>
							<ChatHeadStyled>
								<div className="who">
									<Avatar name="Buyer" size={36} />
									<div>
										<div className="name">
											Buyer ·{" "}
											{activeChat?.buyerId.slice(-6) ??
												""}
										</div>
										<div className="sub">
											{activeChat?.escalatedTo
												? "Escalated"
												: (activeChat?.status ?? "—")}
										</div>
									</div>
								</div>
								<div className="actions">
									<Button
										type="button"
										variant="secondary"
										size="sm"
										onClick={() => setShowReco((s) => !s)}
									>
										Recommend
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										disabled={
											busy || !!activeChat?.escalatedTo
										}
										onClick={escalate}
									>
										Escalate
									</Button>
								</div>
							</ChatHeadStyled>

							<MessagesStyled data-testid="consultant-messages">
								{messages.length === 0 && (
									<EmptyStyled>No messages yet.</EmptyStyled>
								)}
								{messages.map((m) => {
									const mine = m.senderId === myId;
									if (
										m.kind === "recommendation" &&
										m.recommendation
									) {
										return (
											<RecoCardStyled
												key={m._id}
												$mine={mine}
											>
												<Eyebrow
													$gold
													className="reco-label"
												>
													Recommended:{" "}
													{
														m.recommendation
															.inspectionType
													}
												</Eyebrow>
												<div className="reco-desc">
													{m.recommendation
														.description || m.body}
												</div>
												<div className="reco-price">
													{naira(
														m.recommendation.price,
													)}
												</div>
											</RecoCardStyled>
										);
									}
									if (m.kind === "escalation") {
										return (
											<SystemLineStyled key={m._id}>
												Escalated to admin: {m.body}
											</SystemLineStyled>
										);
									}
									return (
										<BubbleStyled key={m._id} $mine={mine}>
											{m.body}
										</BubbleStyled>
									);
								})}
							</MessagesStyled>

							{error && (
								<div role="alert" className="error-line">
									{error}
								</div>
							)}

							{showReco && (
								<PanelStyled>
									<label htmlFor="reco-inspection-type">
										Inspection type
										<Select
											inputId="reco-inspection-type"
											ariaLabel="Inspection type"
											value={reco.inspectionType}
											onChange={(v) =>
												setReco((r) => ({
													...r,
													inspectionType: v,
												}))
											}
											options={[
												{
													value: "standard",
													label: "Standard",
												},
												{
													value: "premium",
													label: "Premium",
												},
												{
													value: "special_request",
													label: "Special request",
												},
											]}
										/>
									</label>
									<label>
										Price (₦)
										<input
											inputMode="numeric"
											value={reco.price}
											onChange={(e) =>
												setReco((r) => ({
													...r,
													price: e.target.value,
												}))
											}
											placeholder="e.g. 52,000"
										/>
									</label>
									<label>
										Description
										<textarea
											rows={2}
											value={reco.description}
											onChange={(e) =>
												setReco((r) => ({
													...r,
													description: e.target.value,
												}))
											}
											placeholder="Why this plan fits…"
										/>
									</label>
									<Button
										type="button"
										variant="primary"
										size="sm"
										disabled={busy}
										onClick={sendRecommendation}
									>
										Send recommendation
									</Button>
								</PanelStyled>
							)}

							<ComposerStyled onSubmit={send}>
								<InputStyled
									placeholder="Type your reply…"
									value={text}
									onChange={(e) => setText(e.target.value)}
									disabled={busy}
								/>
								<Button
									type="submit"
									variant="primary"
									size="sm"
									iconRight="send"
									disabled={!text.trim() || busy}
								>
									Send
								</Button>
							</ComposerStyled>
						</>
					)}
				</ChatPaneStyled>
			</GridStyled>
		</PageShell>
	);
}
