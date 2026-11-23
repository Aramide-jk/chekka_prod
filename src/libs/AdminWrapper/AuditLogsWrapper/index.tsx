"use client";

import useSWR from "swr";
import { Eyebrow, Pill } from "@/components";
import { fetcher } from "@/constants";
import { PageShell } from "@/layouts";
import type { IResponseEnvelope } from "@/types";
import { EmptyStyled, MonoStyled, RowStyled, SectionStyled } from "./styled";

interface IAuditLog {
	_id: string;
	actorEmail?: string;
	action: string;
	target?: string;
	before?: Record<string, unknown>;
	after?: Record<string, unknown>;
	ip?: string;
	userAgent?: string;
	createdAt: string;
}

function relTime(iso: string): string {
	const t = new Date(iso).getTime();
	const diff = Date.now() - t;
	if (diff < 60_000) return "just now";
	if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
	if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} h ago`;
	return new Date(iso).toLocaleString();
}

export default function AuditLogsWrapper() {
	const { data } = useSWR<IResponseEnvelope<{ logs: IAuditLog[] }>>(
		"/api/admin/audit-logs?limit=100",
		fetcher,
		{ revalidateOnMount: true, refreshInterval: 30_000 },
	);
	const logs = data?.data?.logs ?? [];

	return (
		<PageShell
			eyebrow="Admin · Audit"
			title="Audit"
			titleEm="trail"
			navTitle="Audit log"
			subtitle="Append-only trail of every admin mutation, TTL-expired per the audit retention setting."
			right={<Pill tone="gold">{logs.length} entries</Pill>}
		>
			<SectionStyled data-testid="audit-logs">
				<Eyebrow $gold className="recent">
					Most recent
				</Eyebrow>
				{logs.length === 0 ? (
					<EmptyStyled>No admin actions recorded yet.</EmptyStyled>
				) : (
					logs.map((log) => (
						<RowStyled key={log._id}>
							<div>
								<Pill tone="gold">{log.action}</Pill>
								<div className="action-time">
									{relTime(log.createdAt)}
								</div>
							</div>
							<div>
								<div className="actor">
									{log.actorEmail ?? "unknown actor"}
								</div>
								{log.target && (
									<div className="target">
										target: {log.target}
									</div>
								)}
							</div>
							<div>
								{log.before && (
									<MonoStyled>
										before: {JSON.stringify(log.before)}
									</MonoStyled>
								)}
								{log.after && (
									<MonoStyled>
										after: {JSON.stringify(log.after)}
									</MonoStyled>
								)}
							</div>
							<MonoStyled>{log.ip ?? "—"}</MonoStyled>
						</RowStyled>
					))
				)}
			</SectionStyled>
		</PageShell>
	);
}
