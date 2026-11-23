import "server-only";
import type { Types } from "mongoose";
import { ErrInvalidAction } from "@/server/constants/errors";
import {
	adminLiveChannel,
	inspectionSectionChannel,
	publish,
} from "@/server/lib/pubsub";
import {
	type IInspection,
	updateInspectionDB,
} from "@/server/models/inspections";
import type { InspectionStatus } from "@/server/types";
import emitNotification from "../notifications/emitNotification";
import getSiteConfig from "../siteConfigs/getSiteConfig";
import invalidateCacheKeys from "./utils/invalidateCacheKeys";

const BUYER_STATUS_NOTIFICATIONS: Partial<
	Record<InspectionStatus, { title: string; body: string }>
> = {
	assigned: {
		title: "Inspector assigned",
		body: "Your inspector accepted the job.",
	},
	declined: {
		title: "Inspector unavailable",
		body: "Your inspector declined — we're locating a replacement.",
	},
	scheduled: {
		title: "Appointment scheduled",
		body: "Your inspection is locked in.",
	},
	in_progress: {
		title: "Inspection started",
		body: "Tap to watch the live feed.",
	},
	report_processing: {
		title: "Report processing",
		body: "Your inspector is finalising the report.",
	},
	completed: {
		title: "Inspection completed",
		body: "Your report is ready to read.",
	},
};

export default async function updateInspection({
	id,
	previous,
	patch,
}: {
	id: string;
	previous: IInspection;
	patch: Partial<IInspection>;
}): Promise<IInspection | null> {
	const targetStatus = patch.status;

	// Scheduling is established by booking/admin assignment, never by the
	// inspector's generic workflow endpoint.
	if (patch.scheduledFor !== undefined || patch.slot !== undefined) {
		throw ErrInvalidAction;
	}

	if (targetStatus) {
		const transition = `${previous.status}->${targetStatus}`;
		if (transition === "assigned->declined") {
			if (
				patch.acceptedAt ||
				patch.sellerContactedAt ||
				patch.startedAt ||
				patch.completedPhysicalAt ||
				patch.completedAt
			) {
				throw ErrInvalidAction;
			}
		} else if (transition === "assigned->scheduled") {
			if (!patch.acceptedAt || !previous.scheduledFor || !previous.slot)
				throw ErrInvalidAction;
		} else if (transition === "scheduled->in_progress") {
			if (!previous.acceptedAt || !previous.sellerContactedAt || !patch.startedAt)
				throw ErrInvalidAction;
		} else if (transition === "in_progress->report_processing") {
			const config = await getSiteConfig();
			if (
				!patch.completedPhysicalAt ||
				previous.photoCount < config.inspections.minPhotos
			) {
				throw ErrInvalidAction;
			}
		} else {
			throw ErrInvalidAction;
		}
	} else {
		if (
			patch.acceptedAt ||
			patch.startedAt ||
			patch.completedPhysicalAt ||
			patch.completedAt
		) {
			throw ErrInvalidAction;
		}
		if (patch.sellerContactedAt && previous.status !== "scheduled")
			throw ErrInvalidAction;
		if (patch.currentSection && previous.status !== "in_progress")
			throw ErrInvalidAction;
	}

	const updated = await updateInspectionDB(
		id,
		patch,
		undefined,
		targetStatus ? previous.status : undefined,
	);
	if (!updated) throw ErrInvalidAction;

	const buyerId = (updated.buyerId as Types.ObjectId).toString();
	const inspectorId =
		(updated.inspectorId as Types.ObjectId | undefined)?.toString() ??
		(updated.assignedInspectorId as Types.ObjectId | undefined)?.toString();

	await invalidateCacheKeys({ id, buyerId, inspectorId });

	// Broadcast "currently examining" changes to the live feed (buyer + admin
	// monitor) so the sticky section bar advances in real time.
	if (
		patch.currentSection &&
		patch.currentSection !== previous.currentSection
	) {
		const sectionEvent = { section: patch.currentSection };
		await publish(inspectionSectionChannel(id), sectionEvent).catch(
			() => undefined,
		);
		await publish(adminLiveChannel(), {
			type: "section",
			kind: "section",
			inspectionId: id,
			...sectionEvent,
		}).catch(() => undefined);
	}

	const newStatus = patch.status;
	if (newStatus && newStatus !== previous.status) {
		const meta = BUYER_STATUS_NOTIFICATIONS[newStatus];
		if (meta) {
			await emitNotification({
				userId: buyerId,
				kind: `inspection.status.${newStatus}`,
				title: meta.title,
				body: meta.body,
				link: `/inspections/${id}`,
			}).catch(() => undefined);
		}
	}

	return updated;
}
