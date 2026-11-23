import "server-only";
import {
	findPhotoByIdDB,
	type IInspectionPhoto,
	softDeletePhotoDB,
} from "@/server/models/inspectionPhotos";
import { decrementPhotoCountDB } from "@/server/models/inspections";
import invalidateCacheKeys from "./utils/invalidateCacheKeys";

export interface IDeletePhotoInput {
	photoId: string;
	inspectionId: string;
}

// Soft-deletes a single inspection photo and keeps the inspection's photoCount
// in sync. Returns false when the photo doesn't exist or doesn't belong to the
// given inspection (so the caller can 404 rather than silently no-op).
export default async function deletePhoto({
	photoId,
	inspectionId,
}: IDeletePhotoInput): Promise<boolean> {
	const photo: IInspectionPhoto | null = await findPhotoByIdDB(photoId);
	if (!photo || photo.inspectionId.toString() !== inspectionId) return false;

	const deleted = await softDeletePhotoDB(photoId);
	if (!deleted) return false;

	await decrementPhotoCountDB(inspectionId);
	await invalidateCacheKeys({ inspectionId });
	return true;
}
