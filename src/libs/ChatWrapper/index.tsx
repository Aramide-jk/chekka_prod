"use client";

import Link from "next/link";
import {
	type FormEvent,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import useSWR from "swr";
import { Avatar, Button, Eyebrow, Pill } from "@/components";
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
	RecoCardStyled,
	SidebarStyled,
	SystemLineStyled,
} from "./styled";

interface IProps {
	context?: string;
}

interface IChat {
	_id: string;
	chatType: "consultant" | "broker";
	status: string;
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

export default function ChatWrapper({ context }: IProps) {
	const { isUserLoggedIn } = useContext(AppContextProvider);
	const [selected, setSelected] = useState<string | null>(null);
	const [text, setText] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	const { data: chatsData, mutate: refreshChats } = useSWR<
		IResponseEnvelope<{ chats: IChat[] }>
	>(isUserLoggedIn ? "/api/chats" : null, fetcher, {
		revalidateOnMount: true,
		refreshInterval: 10_000,
	});
	const chats = chatsData?.data?.chats ?? [];

	useEffect(() => {
		if (!selected && chats.length > 0) {
			setSelected(chats[0]._id);
		}
	}, [chats, selected]);

	useEffect(() => {
		if (!isUserLoggedIn) return;
		if (chats.length === 0 && chatsData) {
			// Brokers are assigned by an admin through the broker-request flow, so
			// a buyer can't start a broker chat directly — there would be no one
			// to answer it. Every standalone "Talk to a broker" entry point
			// therefore opens a consultant chat; the consultant is the human who
			// then arranges a broker. We still forward the original `context` so
			// the consultant knows the buyer came in asking for a broker.
			api()
				.post("/api/chats", {
					chatType: "consultant",
					context: context ?? undefined,
				})
				.then(() => refreshChats())
				.catch(() => undefined);
		}
	}, [isUserLoggedIn, chats.length, chatsData, context, refreshChats]);

	const { data: messageData, mutate: refreshMessages } = useSWR<
		IResponseEnvelope<{ messages: IMessage[]; chat: IChat }>
	>(selected ? `/api/chats/${selected}/messages` : null, fetcher, {
		revalidateOnMount: true,
		refreshInterval: 5_000,
	});
	const messages = messageData?.data?.messages ?? [];
	const myId = useMemo(() => {
		const meChat = messageData?.data?.chat;
		if (!meChat) return undefined;
		return meChat.buyerId;
	}, [messageData?.data?.chat]);

	// The header/avatar reflect who the buyer is *actually* talking to (the
	// selected chat's type), not the URL `context` they arrived with — a broker
	// entry point opens a consultant chat, so it must read "Consultant".
	const activeChat = messageData?.data?.chat;
	const activeIsBroker = activeChat?.chatType === "broker";
	const counterpartyLabel = activeIsBroker ? "Broker" : "Consultant";

	const subtitle =
		context === "broker"
			? "Brokers negotiate, pay, and arrange delivery. Start by chatting with a Chekka consultant — they'll set you up with a broker."
			: context === "special-request"
				? "Tell us about your special inspection request — we'll route it."
				: "Need help before booking? Chat with a Chekka consultant.";

	async function send(e: FormEvent) {
		e.preventDefault();
		if (!selected || !text.trim() || busy) return;
		setBusy(true);
		setError(null);
		try {
			await api().post(`/api/chats/${selected}/messages`, { body: text });
			setText("");
			await refreshMessages();
		} catch (err) {
			setError(getErrorMessage(err, "Could not send"));
		} finally {
			setBusy(false);
		}
	}

	return (
		<PageShell
			eyebrow="Chat"
			title="Talk to"
			titleEm="Chekka"
			navTitle="Chat"
			subtitle={subtitle}
		>
			<GridStyled>
				<SidebarStyled>
					<Eyebrow className="conversations-label">
						Conversations
					</Eyebrow>
					{chats.length === 0 && (
						<EmptyStyled>
							{isUserLoggedIn
								? "Starting a conversation…"
								: "Sign in to chat with a consultant."}
						</EmptyStyled>
					)}
					{chats.map((c) => (
						<ContactRowStyled
							key={c._id}
							$on={selected === c._id}
							onClick={() => setSelected(c._id)}
						>
							<Avatar name={c.chatType} size={40} />
							<ContactInfoStyled>
								<ContactNameStyled>
									{c.chatType === "broker"
										? "Broker"
										: "Consultant"}
								</ContactNameStyled>
								<ContactMetaStyled>
									{c.lastMessage ?? "No messages yet"}
								</ContactMetaStyled>
							</ContactInfoStyled>
						</ContactRowStyled>
					))}
				</SidebarStyled>

				<ChatPaneStyled>
					<ChatHeadStyled>
						<div className="who">
							<Avatar name={counterpartyLabel} size={36} />
							<div>
								<div className="name">{counterpartyLabel}</div>
								<div className="sub">
									{activeChat?.status ?? "—"}
								</div>
							</div>
						</div>
						<Pill tone="gold" dot>
							Connected
						</Pill>
					</ChatHeadStyled>
					<MessagesStyled data-testid="chat-messages">
						{messages.length === 0 && (
							<EmptyStyled>
								Send the first message to get started.
							</EmptyStyled>
						)}
						{messages.map((m) => {
							const mine = m.senderId === myId;
							if (
								m.kind === "recommendation" &&
								m.recommendation
							) {
								return (
									<RecoCardStyled key={m._id} $mine={mine}>
										<Eyebrow $gold>
											Recommended:{" "}
											{m.recommendation.inspectionType}
										</Eyebrow>
										<div className="reco-desc">
											{m.recommendation.description ||
												m.body}
										</div>
										<div className="reco-price">
											₦
											{Number(
												m.recommendation.price || 0,
											).toLocaleString("en-NG")}
										</div>
										<Link
											href={
												m.recommendation.ctaLink ??
												"/book"
											}
										>
											<Button
												variant="primary"
												size="sm"
												fullWidth
											>
												Book now
											</Button>
										</Link>
									</RecoCardStyled>
								);
							}
							if (m.kind === "escalation") {
								return (
									<SystemLineStyled key={m._id}>
										Escalated to admin
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
					<ComposerStyled onSubmit={send}>
						<InputStyled
							placeholder="Type your message…"
							value={text}
							onChange={(e) => setText(e.target.value)}
							disabled={!selected || busy}
						/>
						<Button
							type="submit"
							variant="primary"
							size="sm"
							iconRight="send"
							disabled={!text.trim() || !selected || busy}
						>
							Send
						</Button>
					</ComposerStyled>
				</ChatPaneStyled>
			</GridStyled>
		</PageShell>
	);
}
