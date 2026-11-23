import "server-only";
import { ErrNotFound } from "@/server/constants/errors";
import type { IInspectorProfile } from "@/server/models/inspectorProfiles";
import updateProfile from "../inspectorProfiles/updateProfile";
import emitNotification from "../notifications/emitNotification";

// Approve or revoke an inspector's professional certificate. Approval stamps
// `certificateApprovedAt`, which is what the "Certified Inspector" badge keys
// off (distinct from identity verification, tracked on the user's status).
export default async function setCertificateApproval({
	userId,
	approved,
}: {
	userId: string;
	approved: boolean;
}): Promise<IInspectorProfile> {
	const profile = await updateProfile({
		userId,
		patch: { certificateApprovedAt: approved ? new Date() : null },
	});
	if (!profile) throw ErrNotFound;

	await emitNotification({
		userId,
		kind: approved
			? "inspector.certificate.approved"
			: "inspector.certificate.revoked",
		title: approved ? "You're now Certified" : "Certification revoked",
		body: approved
			? "Your professional certificate was approved — you now carry the Certified Inspector badge."
			: "Your Certified Inspector status has been revoked. Contact support for details.",
		link: "/inspector",
	}).catch(() => undefined);

	return profile;
}
