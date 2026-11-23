import "server-only";
import type { Types } from "mongoose";
import {
	aggregateInspectorRatingDB,
	type IInspection,
	updateInspectionDB,
} from "@/server/models/inspections";
import { updateInspectorProfileDB } from "@/server/models/inspectorProfiles";
import emitNotification from "../notifications/emitNotification";
import invalidateCacheKeys from "./utils/invalidateCacheKeys";

export interface IRateInspectionInput {
	id: string;
	score: number;
	comment?: string;
}

export default async function rateInspection({
	id,
	score,
	comment,
}: IRateInspectionInput): Promise<IInspection | null> {
	const updated = await updateInspectionDB(id, {
		rating: { score, comment, ratedAt: new Date() },
	});
	if (!updated) return null;

	const inspectorId =
		(updated.inspectorId as Types.ObjectId | undefined)?.toString() ??
		(updated.assignedInspectorId as Types.ObjectId | undefined)?.toString();

	if (inspectorId) {
		// Recompute the inspector's aggregate rating from all their rated jobs.
		const { avg } = await aggregateInspectorRatingDB(inspectorId);
		await updateInspectorProfileDB(inspectorId, {
			rating: Math.round(avg * 10) / 10,
		}).catch(() => undefined);

		await emitNotification({
			userId: inspectorId,
			kind: "inspector.rated",
			title: "You received a rating",
			body: `A buyer rated your inspection ${score}/5.`,
			link: `/inspector/inspections/${id}`,
		}).catch(() => undefined);
	}

	const buyerId = (updated.buyerId as Types.ObjectId).toString();
	await invalidateCacheKeys({ id, buyerId, inspectorId });

	return updated;
}
