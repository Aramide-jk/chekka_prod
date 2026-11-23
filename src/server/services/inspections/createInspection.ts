import "server-only";
import type { Types } from "mongoose";
import {
	ErrInspectionSlotUnavailable,
	ErrInspectorUnavailable,
	ErrInvalidAction,
} from "@/server/constants/errors";
import {
	createInspectionDB,
	type IInspection,
} from "@/server/models/inspections";
import type { InspectionStatus, InspectionType } from "@/server/types";
import emitNotification from "../notifications/emitNotification";
import getSiteConfig from "../siteConfigs/getSiteConfig";
import getUserById from "../users/getUserById";
import invalidateCacheKeys from "./utils/invalidateCacheKeys";

export interface ICreateInspectionInput {
	buyerId: string;
	inspectionType: InspectionType;
	car: IInspection["car"];
	buyerContact?: IInspection["buyerContact"];
	urgent?: boolean;
	assignedInspectorId?: string;
	scheduledFor?: string;
	slot?: string;
}

// Flat surcharge applied to urgent jobs (same-day priority). Added on top of
// the base inspection price so the inspector payout and platform take both
// scale with the premium.
const URGENT_SURCHARGE = 10_000;

export default async function createInspection({
	payload,
}: {
	payload: ICreateInspectionInput;
}): Promise<IInspection> {
	if (payload.assignedInspectorId) {
		const inspector = await getUserById({
			id: payload.assignedInspectorId,
		});
		if (
			!inspector ||
			inspector.role !== "inspector" ||
			inspector.status !== "approved"
		) {
			throw ErrInspectorUnavailable;
		}
		if (!payload.scheduledFor || !payload.slot) throw ErrInvalidAction;
	}
	// Pricing is admin-tunable via /admin/settings. Falls back to the
	// hard-coded defaults baked into `SITE_CONFIG_DEFAULTS` if the
	// siteConfigs row hasn't been written yet.
	const config = await getSiteConfig();
	const priceByType: Record<InspectionType, number> = {
		standard: config.pricing.standardInspectionPrice,
		premium: config.pricing.premiumInspectionPrice,
		special_request: 0,
	};
	const basePrice = priceByType[payload.inspectionType];
	const price = basePrice + (payload.urgent ? URGENT_SURCHARGE : 0);
	let inspection: IInspection;
	try {
		inspection = await createInspectionDB({
			buyerId: payload.buyerId as unknown as Types.ObjectId,
			inspectionType: payload.inspectionType,
			car: payload.car,
			buyerContact: payload.buyerContact,
			urgent: payload.urgent ?? false,
			price,
			platformFee: config.pricing.platformFee,
			status: "submitted",
			assignedInspectorId:
				payload.assignedInspectorId as unknown as Types.ObjectId,
			scheduledFor: payload.scheduledFor
				? new Date(payload.scheduledFor)
				: undefined,
			slot: payload.slot,
			...(payload.assignedInspectorId
				? {
						assignedAt: new Date(),
						status: "assigned" as InspectionStatus,
					}
				: {}),
		});
	} catch (error) {
		if ((error as { code?: number } | undefined)?.code === 11000) {
			throw ErrInspectionSlotUnavailable;
		}
		throw error;
	}

	await invalidateCacheKeys({
		id: inspection._id.toString(),
		buyerId: payload.buyerId,
		inspectorId: payload.assignedInspectorId,
	});

	await emitNotification({
		userId: payload.buyerId,
		kind: "inspection.booking_confirmed",
		title: "Booking confirmed",
		body: `${payload.car.make} ${payload.car.model} — we're locating an inspector.`,
		link: `/inspections/${inspection._id.toString()}`,
	}).catch(() => undefined);

	if (payload.assignedInspectorId) {
		await emitNotification({
			userId: payload.assignedInspectorId,
			kind: "inspector.job_assigned",
			title: "New job assigned",
			body: `${payload.car.make} ${payload.car.model} in ${payload.car.city}.`,
			link: `/inspector/inspections/${inspection._id.toString()}`,
		}).catch(() => undefined);
	}

	return inspection;
}
