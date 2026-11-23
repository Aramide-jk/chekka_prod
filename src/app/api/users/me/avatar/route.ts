import { ErrInvalidFields, ErrUserNotFound } from "@/server/constants/errors";
import { uploadAndResizeImage } from "@/server/helpers";
import {
	ok,
	parseMultipart,
	singleFileBuffer,
	validateUploadedFile,
	withApiHandler,
	withAuth,
} from "@/server/lib";
import { resolveSessionAvatar, toSessionUser } from "@/server/lib/session";
import { updateUser } from "@/server/services/users";

export const runtime = "nodejs";

// Set/replace the signed-in user's profile picture. The image is uploaded to S3
// (content-addressed) and only its key is persisted; the response returns the
// session user with the avatar resolved to a viewer-ready URL so the client can
// swap the header/settings image immediately.
export const POST = withApiHandler(
	{
		route: "/api/users/me/avatar",
		rateLimit: { windowMs: 60_000, maxRequests: 20 },
	},
	withAuth(async ({ req, auth }) => {
		const parsed = await parseMultipart(req);
		const file = singleFileBuffer(parsed, "avatar");
		if (
			!validateUploadedFile(file, {
				allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"],
				maxBytes: 5 * 1024 * 1024,
			})
		) throw ErrInvalidFields;

		const key = await uploadAndResizeImage({
			basePath: `avatars/${auth.userId}`,
			buffer: file.buffer,
			mimeType: file.mimeType,
		});

		const user = await updateUser({
			id: auth.userId,
			payload: { avatar: key },
		});
		if (!user) throw ErrUserNotFound;
		return ok(
			{ user: await resolveSessionAvatar(toSessionUser(user)) },
			"Photo updated",
		);
	}),
);
