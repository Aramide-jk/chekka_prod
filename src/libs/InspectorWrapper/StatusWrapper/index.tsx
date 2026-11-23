"use client";

import Link from "next/link";
import useSWR from "swr";
import { Button, Eyebrow, Icon, type IconName } from "@/components";
import { fetcher } from "@/constants";
import { PageShell } from "@/layouts";
import type { IResponseEnvelope } from "@/types";
import { BodyStyled, IconWrapStyled, PanelStyled, TitleStyled } from "./styled";

type Status = "pending" | "rejected" | "suspended";

interface IProps {
	status: Status;
}

const COPY: Record<
	Status,
	{
		eyebrow: string;
		title: string;
		titleEm: string;
		icon: IconName;
		body: string;
		cta: string;
		ctaHref: string;
	}
> = {
	pending: {
		eyebrow: "Application received",
		title: "Under",
		titleEm: "review",
		icon: "clock",
		body: "Thanks for applying. Our team is reviewing your documents — most decisions come within 48 hours. We'll email and SMS you the moment we have an update.",
		cta: "Back to home",
		ctaHref: "/",
	},
	rejected: {
		eyebrow: "Application status",
		title: "Application not",
		titleEm: "approved",
		icon: "x",
		body: "Unfortunately we couldn't approve your application at this time. You can reapply after 30 days. If you believe this was a mistake, please contact support.",
		cta: "Contact support",
		ctaHref: "mailto:support@chekka.ng?subject=Inspector%20Application%20Review",
	},
	suspended: {
		eyebrow: "Account status",
		title: "Account",
		titleEm: "suspended",
		icon: "warning",
		body: "Your account has been temporarily suspended. This usually happens due to overdue reports or buyer disputes. Please contact admin to resolve.",
		cta: "Contact admin",
		ctaHref: "mailto:admin@chekka.ng?subject=Inspector%20Account%20Suspension",
	},
};

export default function StatusWrapper({ status }: IProps) {
	const c = COPY[status];

	// On the pending screen, work out whether the inspector has actually
	// submitted their profile + documents yet. If not, this is a freshly
	// signed-up inspector who still needs to complete onboarding — so we point
	// them to the application form rather than telling them to wait.
	const { data, isLoading } = useSWR<
		IResponseEnvelope<{
			profile: { documents?: { idDocument?: string; certificate?: string } } | null;
		}>
	>(status === "pending" ? "/api/inspector-profiles/me" : null, fetcher, {
		revalidateOnMount: true,
	});
	const profile = data?.data?.profile ?? null;
	// A government ID is the only mandatory document — the professional
	// certificate is optional (it upgrades the inspector to "Certified" once
	// approved). Mirror the apply endpoint, which only requires the ID; gating
	// on the certificate here would trap correctly-applied inspectors on the
	// "finish your application" screen forever.
	const profileIncomplete =
		status === "pending" && !isLoading && !profile?.documents?.idDocument;

	const eyebrow = profileIncomplete ? "Finish your application" : c.eyebrow;
	const title = profileIncomplete ? "Complete your" : c.title;
	const titleEm = profileIncomplete ? "profile" : c.titleEm;
	const body = profileIncomplete
		? "You're almost there. Complete your profile and upload your government ID. You can start receiving jobs once Chekka verifies your account."
		: c.body;
	const cta = profileIncomplete ? "Complete profile" : c.cta;
	const ctaHref = profileIncomplete ? "/inspector/apply" : c.ctaHref;

	return (
		<PageShell
			navTitle={`Inspector · ${status}`}
			showAccount={false}
			maxWidth={900}
		>
			<PanelStyled data-testid={`status-${status}`}>
				<IconWrapStyled $tone={status}>
					<Icon name={c.icon} size={32} />
				</IconWrapStyled>
				<Eyebrow $gold>{eyebrow}</Eyebrow>
				<TitleStyled>
					{title} <em>{titleEm}</em>
				</TitleStyled>
				<BodyStyled>{body}</BodyStyled>
				<Link href={ctaHref}>
					<Button variant="primary" size="md">
						{cta}
					</Button>
				</Link>
			</PanelStyled>
		</PageShell>
	);
}
