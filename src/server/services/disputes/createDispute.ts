import "server-only";
import type { Types } from "mongoose";
import { createDisputeDB, type IDispute } from "@/server/models/disputes";
import { getPaidTransactionForInspectionDB, updateTransactionDB } from "@/server/models/transactions";
import { listUsersByRoleDB } from "@/server/models/users";
import emitNotification from "../notifications/emitNotification";
import invalidateCacheKeys from "./utils/invalidateCacheKeys";

export interface ICreateDisputeInput {
	inspectionId: string;
	raisedBy: string;
	statement: string;
}

export default async function createDispute({
	inspectionId,
	raisedBy,
	statement,
}: ICreateDisputeInput): Promise<IDispute> {
	const dispute = await createDisputeDB({
		inspectionId: inspectionId as unknown as Types.ObjectId,
		raisedBy: raisedBy as unknown as Types.ObjectId,
		statement,
		status: "open",
		resolution: null,
	});
	const transaction = await getPaidTransactionForInspectionDB(inspectionId);
	if (transaction && transaction.payoutStatus !== "released") {
		await updateTransactionDB(transaction._id.toString(), {
			payoutStatus: "held_dispute",
			payoutFailureReason: "Payout blocked by an open dispute",
		});
	}

	await invalidateCacheKeys();

	// Alert admins so the dispute surfaces in their queue promptly.
	const admins = await listUsersByRoleDB("admin", {}, 20, 0).catch(() => []);
	await Promise.all(
		admins.map((a) =>
			emitNotification({
				userId: a._id,
				kind: "dispute.opened",
				title: "New dispute raised",
				body: "A buyer has raised a dispute on an inspection report.",
				link: "/admin/disputes",
			}).catch(() => undefined),
		),
	);

	return dispute;
}
