import "server-only";
import crypto from "node:crypto";
import getImageKitInstance from "./getImageKitInstance";

/**
 * Upload a buffer to ImageKit (when credentials are present) or generate a
 * deterministic mock key when running locally without ImageKit.
 *
 * The object key is content-addressed: `<basePath>/<sha256(bytes)>.<ext>`.
 * Identical bytes produce the same key/path.
 *
 * Returns the stored key (e.g. `inspections/<id>/photos/<hash>.jpeg`), which is
 * resolved to a viewer-ready CDN URL on read via {@link imagekitGetFileLink}.
 */
export default async function uploadAndResizeImage({
	basePath,
	buffer,
	mimeType,
}: {
	basePath: string;
	buffer: Buffer;
	mimeType: string;
}): Promise<string> {
	// `image/svg+xml` → `svg`; `application/pdf` → `pdf`; fall back to `bin`.
	const ext = (mimeType.split("/")[1] || "bin").split("+")[0] || "bin";
	const hash = crypto.createHash("sha256").update(buffer).digest("hex");
	const fileName = `${hash}.${ext}`;
	const folder = basePath.startsWith("/") ? basePath : `/${basePath}`;
	const key = `${basePath.replace(/^\//, "")}/${fileName}`;

	const client = getImageKitInstance();
	if (client) {
		const res = await client.upload({
			file: buffer,
			fileName,
			folder,
			useUniqueFileName: false,
		});
		return res.filePath ? res.filePath.replace(/^\//, "") : key;
	}

	// Local mock — no ImageKit configured. The key is resolved to an in-app proxy URL
	// by imagekitGetFileLink so the rest of the pipeline behaves identically.
	return `mock://${key}`;
}
