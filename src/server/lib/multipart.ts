import "server-only";
import type { NextRequest } from "next/server";
import { ErrInvalidFields } from "../constants/errors";

export interface IParsedFile {
	fieldName: string;
	fileName: string;
	mimeType: string;
	buffer: Buffer;
}

export interface IParsedMultipart {
	fields: Record<string, string>;
	files: IParsedFile[];
}

export async function parseMultipart(
	req: NextRequest,
	maxRequestBytes = 12 * 1024 * 1024,
): Promise<IParsedMultipart> {
	const contentLength = Number(req.headers.get("content-length") ?? 0);
	if (contentLength > maxRequestBytes) throw ErrInvalidFields;
	const contentType = req.headers.get("content-type") || "";
	if (!contentType.includes("multipart/form-data")) {
		const text = await req.text();
		try {
			const j = JSON.parse(text);
			return { fields: j as Record<string, string>, files: [] };
		} catch {
			return { fields: {}, files: [] };
		}
	}
	const formData = await req.formData();
	const fields: Record<string, string> = {};
	const files: IParsedFile[] = [];
	for (const [k, v] of formData.entries()) {
		if (v instanceof File) {
			const buf = Buffer.from(await v.arrayBuffer());
			files.push({
				fieldName: k,
				fileName: v.name,
				mimeType: v.type,
				buffer: buf,
			});
		} else {
			fields[k] = String(v);
		}
	}
	return { fields, files };
}

export function validateUploadedFile(
	file: IParsedFile | null | undefined,
	{
		allowedMimeTypes,
		maxBytes,
	}: { allowedMimeTypes: readonly string[]; maxBytes: number },
): file is IParsedFile {
	if (!file || file.buffer.length === 0 || file.buffer.length > maxBytes)
		return false;
	const mime = file.mimeType.toLowerCase();
	if (!allowedMimeTypes.includes(mime)) return false;

	const b = file.buffer;
	if (mime === "image/jpeg" || mime === "image/jpg")
		return b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
	if (mime === "image/png")
		return b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
	if (mime === "image/webp")
		return b.length >= 12 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP";
	if (mime === "image/heic" || mime === "image/heif")
		return (
			b.length >= 12 &&
			b.toString("ascii", 4, 8) === "ftyp" &&
			["heic", "heix", "hevc", "hevx", "mif1", "msf1"].includes(
				b.toString("ascii", 8, 12),
			)
		);
	if (mime === "application/pdf")
		return b.length >= 5 && b.toString("ascii", 0, 5) === "%PDF-";
	return false;
}

export function singleFileBuffer(
	parsed: IParsedMultipart,
	fieldName: string,
): IParsedFile | null {
	return parsed.files.find((f) => f.fieldName === fieldName) ?? null;
}
