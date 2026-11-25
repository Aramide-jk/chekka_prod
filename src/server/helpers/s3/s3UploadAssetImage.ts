import "server-only";

/*
// AWS S3 Storage Helper (commented out in favor of ImageKit storage)
import crypto from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { S3_BUCKET } from "../../constants";
import getS3Instance from "./getS3Instance";

export default async function uploadAndResizeImage({
	basePath,
	buffer,
	mimeType,
}: {
	basePath: string;
	buffer: Buffer;
	mimeType: string;
}): Promise<string> {
	const ext = (mimeType.split("/")[1] || "bin").split("+")[0] || "bin";
	const hash = crypto.createHash("sha256").update(buffer).digest("hex");
	const key = `${basePath}/${hash}.${ext}`;
	const client = getS3Instance();
	if (client) {
		await client.send(
			new PutObjectCommand({
				Bucket: S3_BUCKET,
				Key: key,
				Body: buffer,
				ContentType: mimeType,
			}),
		);
		return key;
	}
	return `mock://${key}`;
}
*/

export default async function uploadAndResizeImage({
	basePath,
	mimeType,
}: {
	basePath: string;
	buffer: Buffer;
	mimeType: string;
}): Promise<string> {
	// S3 upload asset commented out in favor of ImageKit
	const ext = (mimeType.split("/")[1] || "bin").split("+")[0] || "bin";
	return `mock://${basePath}/mock-asset.${ext}`;
}
