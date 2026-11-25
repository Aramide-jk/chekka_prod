import "server-only";

/*
// AWS S3 Storage Helper (commented out in favor of ImageKit storage)
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { S3_BUCKET } from "../../constants";
import getS3Instance from "./getS3Instance";

export default async function s3DeleteFile({
	key,
}: {
	key: string;
}): Promise<boolean> {
	try {
		const client = getS3Instance();
		if (!client) return false;
		await client.send(
			new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }),
		);
		return true;
	} catch {
		return false;
	}
}
*/

export default async function s3DeleteFile({
	key: _key,
}: {
	key: string;
}): Promise<boolean> {
	// S3 deleted file logic is commented out in favor of ImageKit
	return false;
}
