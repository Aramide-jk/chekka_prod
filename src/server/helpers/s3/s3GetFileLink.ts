import "server-only";

/*
// AWS S3 Storage Helper (commented out in favor of ImageKit storage)
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { CLOUDFRONT_CDN_URL, S3_BUCKET } from "../../constants";
import getS3Instance from "./getS3Instance";

export default async function s3GetFileLink({
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

	if (CLOUDFRONT_CDN_URL) return `${CLOUDFRONT_CDN_URL}/${fileName}`;

	const client = getS3Instance();
	if (!client) return fileName;

	return getSignedUrl(
		client,
		new GetObjectCommand({ Bucket: S3_BUCKET, Key: fileName }),
		{ expiresIn: expiresInSeconds },
	);
}
*/

export default async function s3GetFileLink({
	fileName,
}: {
	fileName: string;
	expiresInSeconds?: number;
}): Promise<string> {
	// S3 presigned URL generator commented out in favor of ImageKit
	return fileName;
}
