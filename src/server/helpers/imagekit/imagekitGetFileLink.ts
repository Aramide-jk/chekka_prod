import "server-only";
import { IMAGEKIT_URL_ENDPOINT } from "../../constants";
import getImageKitInstance from "./getImageKitInstance";

/**
 * Resolve a stored key or path to an ImageKit viewer-ready CDN URL.
 *
 * Resolution order:
 *  - Empty            → `""`.
 *  - `mock://` key    → in-app mock-asset proxy (local dev, no ImageKit).
 *  - Absolute `http`  → returned untouched (already a usable URL).
 *  - ImageKit endpoint configured → full CDN URL.
 *  - Otherwise        → the original `fileName`.
 */
export default async function imagekitGetFileLink({
	fileName,
	expiresInSeconds = 60 * 60,
}: {
	fileName: string;
	expiresInSeconds?: number;
}): Promise<string> {
	if (!fileName) return "";
	if (fileName.startsWith("mock://")) {
		return `/api/mock-asset?key=${encodeURIComponent(fileName.replace("mock://", ""))}`;
	}
	if (fileName.startsWith("http")) return fileName;

	const client = getImageKitInstance();
	if (client) {
		const cleanPath = fileName.startsWith("/") ? fileName : `/${fileName}`;
		return client.url({
			path: cleanPath,
		});
	}

	if (IMAGEKIT_URL_ENDPOINT) {
		const base = IMAGEKIT_URL_ENDPOINT.replace(/\/$/, "");
		const cleanPath = fileName.replace(/^\//, "");
		return `${base}/${cleanPath}`;
	}

	return fileName;
}
