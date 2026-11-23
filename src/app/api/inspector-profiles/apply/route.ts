import { ErrForbidden, ErrInvalidFields } from "@/server/constants/errors";
import {
	created,
	parseMultipart,
	singleFileBuffer,
	validateUploadedFile,
	withApiHandler,
	withAuth,
} from "@/server/lib";
import {
	applyAsInspector,
	getByUserId,
} from "@/server/services/inspectorProfiles";
import { applyFieldsSchema } from "@/server/validators/inspectorProfiles/validate";

export const runtime = "nodejs";

export const POST = withApiHandler(
	{
		route: "/api/inspector-profiles/apply",
		rateLimit: { windowMs: 60_000, maxRequests: 30 },
	},
	withAuth(async ({ req, auth }) => {
		if (auth.role !== "inspector" && auth.role !== "buyer")
			throw ErrForbidden;

		const parsed = await parseMultipart(req, 32 * 1024 * 1024);
		const fieldsParsed = applyFieldsSchema.safeParse(parsed.fields);
		if (!fieldsParsed.success) throw ErrInvalidFields;

		const idDocument = singleFileBuffer(parsed, "idDocument") ?? undefined;
		const certificate =
			singleFileBuffer(parsed, "certificate") ?? undefined;
		const extra = singleFileBuffer(parsed, "extra") ?? undefined;
		const documentTypes = [
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/webp",
			"image/heic",
			"image/heif",
			"application/pdf",
		] as const;
		for (const file of [idDocument, certificate, extra]) {
			if (
				file &&
				!validateUploadedFile(file, {
					allowedMimeTypes: documentTypes,
					maxBytes: 10 * 1024 * 1024,
				})
			) throw ErrInvalidFields;
		}

		// A government ID / driver's licence is mandatory for identity
		// verification. A professional certificate is optional — it upgrades the
		// inspector to "Certified" once approved, but isn't required to apply.
		// Allow a re-application to skip re-uploading an ID already on file.
		const existing = await getByUserId({ userId: auth.userId });
		const hasId = idDocument || existing?.documents?.idDocument;
		if (!hasId) throw ErrInvalidFields;

		const profile = await applyAsInspector({
			userId: auth.userId,
			yearsExperience: fieldsParsed.data.yearsExperience,
			specialisations: fieldsParsed.data.specialisations
				? fieldsParsed.data.specialisations
						.split(",")
						.map((s) => s.trim())
						.filter(Boolean)
				: [],
			bio: fieldsParsed.data.bio ?? "",
			city: fieldsParsed.data.city,
			documents: {
				idDocument,
				certificate,
				extra,
			},
		});

		return created({ profile }, "Application submitted");
	}),
);
