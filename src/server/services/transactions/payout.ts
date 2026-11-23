import "server-only";
import crypto from "node:crypto";
import { ErrInvalidAction } from "@/server/constants/errors";
import { hasBlockingDisputeDB } from "@/server/models/disputes";
import { getInspectorPayoutProfileDB, updateInspectorProfileDB } from "@/server/models/inspectorProfiles";
import { getInspectionByIdDB } from "@/server/models/inspections";
import {
	getPaidTransactionForInspectionDB,
	getTransactionByIdDB,
	transitionTransactionDB,
	type ITransaction,
	updateTransactionDB,
} from "@/server/models/transactions";
import { createPaystackRecipient, initiatePaystackTransfer } from "./paystack";

async function recipientFor(inspectorId: string): Promise<string | null> {
	const profile = await getInspectorPayoutProfileDB(inspectorId);
	const account = profile?.payoutAccount;
	if (!profile || !account?.bankCode || !account.accountNumber || !account.accountName) return null;
	if (account.recipientCode && account.status === "verified") return account.recipientCode;
	const created = await createPaystackRecipient({
		name: account.accountName,
		accountNumber: account.accountNumber,
		bankCode: account.bankCode,
	});
	await updateInspectorProfileDB(inspectorId, {
		payoutAccount: { ...account, recipientCode: created.recipient_code, status: "verified" },
	});
	return created.recipient_code;
}

export async function initiatePayoutForTransaction(transactionId: string): Promise<ITransaction> {
	const transaction = await getTransactionByIdDB(transactionId);
	if (!transaction || transaction.status !== "paid") throw ErrInvalidAction;
	if (transaction.payoutStatus === "released" || transaction.payoutStatus === "processing") return transaction;
	if (["refunded", "held_dispute", "manual_attention"].includes(transaction.payoutStatus)) throw ErrInvalidAction;
	const inspection = await getInspectionByIdDB(transaction.inspectionId.toString());
	if (!inspection || inspection.status !== "completed" || !inspection.reportLockedAt) throw ErrInvalidAction;
	if (await hasBlockingDisputeDB(inspection._id.toString())) throw ErrInvalidAction;
	const inspectorId = (
		transaction.inspectorId ?? inspection.inspectorId ?? inspection.assignedInspectorId
	)?.toString();
	if (!inspectorId || transaction.inspectorPayableAmountMinor <= 0) throw ErrInvalidAction;

	const recipient = await recipientFor(inspectorId);
	if (!recipient) {
		const actionable = await updateTransactionDB(transactionId, {
			inspectorId: inspectorId as never,
			payoutStatus: "action_required",
			payoutFailureReason: "Inspector payout account is not configured",
		});
		return actionable ?? transaction;
	}

	const transferReference = (transaction.payoutStatus === "failed" ? undefined : transaction.transferReference) ??
		`payout_${transaction._id.toString()}_${crypto.randomBytes(5).toString("hex")}`;
	const processing = await transitionTransactionDB(
		transactionId,
		{ payoutStatus: { $in: ["held", "eligible", "action_required", "failed"] } },
		{
			inspectorId: inspectorId as never,
			payoutStatus: "processing",
			transferReference,
			payoutFailureReason: undefined,
		},
	);
	if (!processing) {
		const current = await getTransactionByIdDB(transactionId);
		if (current) return current;
		throw ErrInvalidAction;
	}
	try {
		const transfer = await initiatePaystackTransfer({
			amount: processing.inspectorPayableAmountMinor,
			recipient,
			reference: transferReference,
			reason: `Chekka inspection ${inspection._id.toString()} payout`,
		});
		return (await updateTransactionDB(transactionId, {
			paystackTransferCode: transfer.transfer_code,
		})) ?? processing;
	} catch (error) {
		await transitionTransactionDB(transactionId, { payoutStatus: "processing" }, {
			payoutStatus: "failed",
			payoutFailureReason: "Paystack transfer initiation failed",
		});
		throw error;
	}
}

export async function makeInspectionPayoutEligible(inspectionId: string): Promise<ITransaction | null> {
	const transaction = await getPaidTransactionForInspectionDB(inspectionId);
	if (!transaction || ["released", "refunded", "held_dispute"].includes(transaction.payoutStatus)) return transaction;
	const eligible = await transitionTransactionDB(
		transaction._id.toString(),
		{ status: "paid", payoutStatus: { $in: ["held", "not_eligible", "action_required", "failed"] } },
		{ payoutStatus: "eligible", payoutEligibleAt: new Date() },
	);
	if (!eligible) return transaction;
	return initiatePayoutForTransaction(eligible._id.toString());
}
