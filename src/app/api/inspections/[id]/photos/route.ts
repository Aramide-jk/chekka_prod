import {
	ErrForbidden,
	ErrInspectionNotFound,
	ErrInvalidFields,
	ErrInvalidAction,
} from "@/server/constants/errors";
import { s3GetFileLink } from "@/server/helpers";
import {
	created,
	ok,
	parseMultipart,
	singleFileBuffer,
	validateUploadedFile,
	withApiHandler,
	withAuth,
} from "@/server/lib";
import type { IInspectionPhoto } from "@/server/models/inspectionPhotos";
import {
	deletePhoto,
	listForInspection,
	PHOTO_CACHE_TTL_SECONDS,
	uploadPhoto,
} from "@/server/services/inspectionPhotos";
import { getInspectionById } from "@/server/services/inspections";
import { photoSectionSchema } from "@/server/validators/inspections/validate";

// Resolve the stored S3 key to a viewer-ready URL (signed S3, CDN, mock proxy
// — whatever `s3GetFileLink` decides). Without this the client receives a raw
// key like `inspections/abc/photos/123.jpeg` that isn't a valid <img src>.
async function withResolvedUrl<T extends Pick<IInspectionPhoto, "url">>(
	photo: T,
): Promise<T & { url: string }> {
	// Presigned link expires with the photo-list cache window (the data being
	// processed) — a fresh link is minted on every request.
	const url = await s3GetFileLink({
		fileName: photo.url,
		expiresInSeconds: PHOTO_CACHE_TTL_SECONDS,
	}).catch(() => photo.url);
	return { ...photo, url };
}

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withApiHandler<Ctx>(
	{
		route: "/api/inspections/:id/photos",
		rateLimit: { windowMs: 60_000, maxRequests: 300 },
	},
	withAuth<Ctx>(async ({ auth, context }) => {
		const { id } = await context.params;
		const ins = await getInspectionById({ id });
		if (!ins) throw ErrInspectionNotFound;
		const allowed =
			auth.role === "admin" ||
			auth.role === "consultant" ||
			(auth.role === "buyer" && ins.buyerId.toString() === auth.userId) ||
			(auth.role === "inspector" &&
				((
					ins.inspectorId as { toString(): string } | undefined
				)?.toString() === auth.userId ||
					(
						ins.assignedInspectorId as
							| { toString(): string }
							| undefined
					)?.toString() === auth.userId));
		if (!allowed) throw ErrForbidden;
		const photos = await listForInspection({ inspectionId: id });
		const resolved = await Promise.all(
			photos.map((p) => {
				const lean =
					p.toObject?.() ?? (p as unknown as IInspectionPhoto);
				return withResolvedUrl(lean);
			}),
		);
		return ok({ photos: resolved });
	}),
);

export const POST = withApiHandler<Ctx>(
	{
		route: "/api/inspections/:id/photos",
		rateLimit: { windowMs: 60_000, maxRequests: 300 },
	},
	withAuth<Ctx>(async ({ req, auth, context }) => {
		if (auth.role !== "inspector" && auth.role !== "admin")
			throw ErrForbidden;
		const { id } = await context.params;
		const ins = await getInspectionById({ id });
		if (!ins) throw ErrInspectionNotFound;
		if (
			auth.role === "inspector" &&
			(
				ins.inspectorId as { toString(): string } | undefined
			)?.toString() !== auth.userId &&
			(
				ins.assignedInspectorId as { toString(): string } | undefined
			)?.toString() !== auth.userId
		) {
			throw ErrForbidden;
		}
		if (ins.status !== "in_progress") throw ErrInvalidAction;

		const parsed = await parseMultipart(req);
		const section = photoSectionSchema.safeParse(parsed.fields.section);
		if (!section.success) throw ErrInvalidFields;

		const file = singleFileBuffer(parsed, "photo");
		if (
			!validateUploadedFile(file, {
				allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"],
				maxBytes: 10 * 1024 * 1024,
			})
		) throw ErrInvalidFields;
		const { photo, duplicate } = await uploadPhoto({
			inspectionId: id,
			section: section.data,
			note: parsed.fields.note,
			file,
			urlOverride: parsed.fields.url,
		});

		const lean =
			photo.toObject?.() ?? (photo as unknown as IInspectionPhoto);
		const resolved = await withResolvedUrl(lean);
		return created(
			{ photo: resolved, duplicate },
			duplicate ? "This image was already uploaded" : "Photo received",
		);
	}),
);

export const DELETE = withApiHandler<Ctx>(
	{
		route: "/api/inspections/:id/photos",
		rateLimit: { windowMs: 60_000, maxRequests: 120 },
	},
	withAuth<Ctx>(async ({ req, auth, context }) => {
		if (auth.role !== "inspector" && auth.role !== "admin")
			throw ErrForbidden;
		const { id } = await context.params;
		const ins = await getInspectionById({ id });
		if (!ins) throw ErrInspectionNotFound;
		if (
			auth.role === "inspector" &&
			(
				ins.inspectorId as { toString(): string } | undefined
			)?.toString() !== auth.userId &&
			(
				ins.assignedInspectorId as { toString(): string } | undefined
			)?.toString() !== auth.userId
		) {
			throw ErrForbidden;
		}
		// Once the report is locked the photo set is part of the filed record —
		// it must not be mutated.
		if (ins.reportLockedAt) throw ErrForbidden;

		const photoId = new URL(req.url).searchParams.get("photoId");
		if (!photoId) throw ErrInvalidFields;
		const ok2 = await deletePhoto({ photoId, inspectionId: id });
		if (!ok2) throw ErrInspectionNotFound;
		return ok({ deleted: true });
	}),
);
