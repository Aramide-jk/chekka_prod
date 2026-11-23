import "server-only";
import { redisRetrieveKeyString } from "@/server/databases/redis";
import {
	getInspectionByIdDB,
	type IReport,
} from "@/server/models/inspections";
import { shareKey } from "./createShareLink";

/**
 * Resolve a share nonce to its inspection. Returns null when the nonce is
 * unknown or expired. Used by the public /share/[nonce] page.
 */
export interface IPublicSharedInspection {
	_id: string;
	status: "completed";
	car: { make: string; model: string; year: number; color?: string };
	completedAt?: string;
	report: IReport;
	photoCount: number;
}

export default async function resolveShareNonce({
	nonce,
}: {
	nonce: string;
}): Promise<IPublicSharedInspection | null> {
	const mapping = await redisRetrieveKeyString<{ inspectionId: string }>(
		shareKey(nonce),
	);
	if (!mapping?.inspectionId) return null;
	const inspection = await getInspectionByIdDB(mapping.inspectionId);
	if (
		!inspection ||
		inspection.status !== "completed" ||
		!inspection.report ||
		!inspection.reportLockedAt
	) return null;

	return {
		_id: nonce,
		status: "completed",
		car: {
			make: inspection.car.make,
			model: inspection.car.model,
			year: inspection.car.year,
			...(inspection.car.color ? { color: inspection.car.color } : {}),
		},
		completedAt: inspection.completedAt?.toISOString(),
		report: JSON.parse(JSON.stringify(inspection.report)) as IReport,
		photoCount: inspection.photoCount,
	};
}
