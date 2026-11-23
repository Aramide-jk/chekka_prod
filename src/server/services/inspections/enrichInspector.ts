import "server-only";
import { s3GetFileLink } from "@/server/helpers";
import type { IInspection } from "@/server/models/inspections";
import getInspectorProfile from "../inspectorProfiles/getByUserId";
import getUserById from "../users/getUserById";

// The inspector as shown on the buyer/admin report view. `badge` differentiates
// identity verification ("verified", account approved) from professional
// certification ("certified", an approved professional certificate on file).
export interface EnrichedInspector {
	id: string;
	fullName: string;
	avatar?: string;
	city?: string;
	rating?: number;
	totalCompleted?: number;
	badge?: "certified" | "verified" | null;
}

export interface Viewer {
	role: string;
	userId: string;
}

// An inspection enriched with the assigned inspector's display details so
// buyer/admin views can render a proper inspector header instead of a bare
// ObjectId. `canRate` is computed against the viewer so the client only shows
// the rating control when the rating POST will actually be authorised.
export type EnrichedInspection = Record<string, unknown> & {
	inspector: EnrichedInspector | null;
	canRate?: boolean;
	viewerRole?: string | null;
};

function inspectorIdOf(ins: IInspection): string | null {
	const assigned = (
		ins.assignedInspectorId as { toString(): string } | undefined | null
	)?.toString();
	const direct = (
		ins.inspectorId as { toString(): string } | undefined | null
	)?.toString();
	return direct || assigned || null;
}

function toPlain(ins: IInspection): Record<string, unknown> {
	const maybe = ins as unknown as {
		toObject?: () => Record<string, unknown>;
	};
	return maybe.toObject
		? maybe.toObject()
		: (ins as unknown as Record<string, unknown>);
}

async function loadInspector(id: string): Promise<EnrichedInspector | null> {
	const [user, profile] = await Promise.all([
		getUserById({ id }),
		getInspectorProfile({ userId: id }).catch(() => null),
	]);
	if (!user) return null;
	// Resolve a stored avatar key to a viewer-ready (presigned) URL.
	const avatar = user.avatar
		? await s3GetFileLink({
				fileName: user.avatar,
				expiresInSeconds: 60 * 60,
			}).catch(() => undefined)
		: undefined;
	// "Certified" requires an admin to have approved the uploaded certificate —
	// merely having one on file isn't enough. "Verified" reflects identity
	// verification (the account being approved).
	const certified = !!profile?.certificateApprovedAt;
	return {
		id,
		fullName: user.fullName,
		avatar: avatar || undefined,
		city: user.city,
		rating: profile?.rating,
		totalCompleted: profile?.totalCompleted,
		badge: certified
			? "certified"
			: user.status === "approved"
				? "verified"
				: null,
	};
}

export async function enrichInspection(
	ins: IInspection,
	viewer?: Viewer,
): Promise<EnrichedInspection> {
	const id = inspectorIdOf(ins);
	const inspector = id ? await loadInspector(id) : null;
	const canRate = !!(
		viewer &&
		viewer.role === "buyer" &&
		(ins.buyerId as { toString(): string }).toString() === viewer.userId &&
		ins.status === "completed" &&
		id &&
		!ins.rating
	);
	return {
		...toPlain(ins),
		inspector,
		canRate,
		viewerRole: viewer?.role ?? null,
	};
}

export async function enrichInspections(
	list: IInspection[],
): Promise<EnrichedInspection[]> {
	// Resolve each unique inspector once, then map. List views only need the
	// display name, so this stays a single users lookup per inspector (no
	// profile/avatar fan-out — that's reserved for the single-inspection view).
	const ids = Array.from(
		new Set(list.map(inspectorIdOf).filter((x): x is string => !!x)),
	);
	const nameById = new Map<string, string>();
	await Promise.all(
		ids.map(async (id) => {
			const user = await getUserById({ id });
			if (user) nameById.set(id, user.fullName);
		}),
	);
	return list.map((ins) => {
		const id = inspectorIdOf(ins);
		return {
			...toPlain(ins),
			inspector:
				id && nameById.has(id)
					? { id, fullName: nameById.get(id) as string }
					: null,
		};
	});
}
