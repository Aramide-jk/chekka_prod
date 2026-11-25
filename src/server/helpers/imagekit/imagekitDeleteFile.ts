import "server-only";
import getImageKitInstance from "./getImageKitInstance";

/**
 * Delete an object from ImageKit by path or fileId. Returns `false` (rather than throwing)
 * when ImageKit is unconfigured or the delete fails, so cleanup paths never break the
 * surrounding request.
 */
export default async function imagekitDeleteFile({
	key,
}: {
	key: string;
}): Promise<boolean> {
	try {
		const client = getImageKitInstance();
		if (!client) return false;

		const cleanPath = key.startsWith("/") ? key : `/${key}`;
		const files = await client.listFiles({
			path: cleanPath,
			limit: 1,
		});

		if (files && Array.isArray(files) && files.length > 0) {
			const first = files[0];
			if (first && "fileId" in first && typeof first.fileId === "string") {
				await client.deleteFile(first.fileId);
				return true;
			}
		}

		return true;
	} catch {
		return false;
	}
}
