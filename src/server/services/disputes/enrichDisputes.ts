import "server-only";
import type { IDispute } from "@/server/models/disputes";
import type { IInspection } from "@/server/models/inspections";
import getInspectionById from "../inspections/getInspectionById";
import getUserById from "../users/getUserById";

// A dispute as the admin queue needs to see it: the bare ObjectId references on
// the raw document are resolved to named parties (buyer + inspector) and the
// disputed car, so an admin can identify who is involved and adjudicate without
// chasing IDs across collections.
export interface DisputeParty {
	id: string;
	fullName: string;
	email?: string;
	phone?: string;
	role: string;
}

export interface EnrichedDispute {
	id: string;
	statement: string;
	status: IDispute["status"];
	resolution: IDispute["resolution"];
	createdAt: Date;
	updatedAt: Date;
	// Who physically clicked "raise dispute" — usually the buyer, but resolved
	// independently so the UI never has to assume.
	raisedBy: DisputeParty | null;
	buyer: DisputeParty | null;
	inspector: DisputeParty | null;
	inspection: {
		id: string;
		car: string;
		status: IInspection["status"];
		inspectionType: IInspection["inspectionType"];
	} | null;
	messages: IDispute["messages"];
	internalNotes: IDispute["internalNotes"];
}

function idOf(v: { toString(): string } | undefined | null): string | null {
	const s = v?.toString();
	return s || null;
}

function inspectorIdOf(ins: IInspection): string | null {
	return (
		idOf(ins.inspectorId as { toString(): string } | null) ||
		idOf(ins.assignedInspectorId as { toString(): string } | null)
	);
}

async function loadParty(id: string | null): Promise<DisputeParty | null> {
	if (!id) return null;
	const user = await getUserById({ id }).catch(() => null);
	if (!user) return null;
	return {
		id,
		fullName: user.fullName,
		email: user.email,
		phone: user.phone,
		role: user.role,
	};
}

function carLabel(ins: IInspection): string {
	const { year, make, model } = ins.car ?? {};
	return [year, make, model].filter(Boolean).join(" ") || "Vehicle";
}

async function enrichOne(dispute: IDispute): Promise<EnrichedDispute> {
	const plain = (
		dispute as unknown as { toObject?: () => IDispute }
	).toObject?.() ?? dispute;

	const inspectionId = idOf(plain.inspectionId);
	const inspection = inspectionId
		? await getInspectionById({ id: inspectionId }).catch(() => null)
		: null;

	const buyerId = inspection ? idOf(inspection.buyerId) : null;
	const inspectorId = inspection ? inspectorIdOf(inspection) : null;

	const [raisedBy, buyer, inspector] = await Promise.all([
		loadParty(idOf(plain.raisedBy)),
		loadParty(buyerId),
		loadParty(inspectorId),
	]);

	return {
		id: String(plain._id),
		statement: plain.statement,
		status: plain.status,
		resolution: plain.resolution,
		createdAt: plain.createdAt,
		updatedAt: plain.updatedAt,
		raisedBy,
		buyer,
		inspector,
		inspection: inspection
			? {
					id: String(inspection._id),
					car: carLabel(inspection),
					status: inspection.status,
					inspectionType: inspection.inspectionType,
				}
			: null,
		messages: plain.messages ?? [],
		internalNotes: plain.internalNotes ?? [],
	};
}

export default async function enrichDisputes(
	disputes: IDispute[],
): Promise<EnrichedDispute[]> {
	return Promise.all(disputes.map(enrichOne));
}
