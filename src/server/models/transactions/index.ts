import "server-only";
import mongoose, { type Document, Schema } from "mongoose";
import {
	databaseResponseTimeHistogram,
	IOperationType,
} from "@/server/metrics";

export type PayoutStatus =
	| "not_eligible"
	| "held"
	| "held_dispute"
	| "eligible"
	| "action_required"
	| "processing"
	| "failed"
	| "manual_attention"
	| "released"
	| "refunded";

export interface ITransaction extends Document {
	_id: mongoose.Types.ObjectId;
	buyerId: mongoose.Types.ObjectId;
	inspectorId?: mongoose.Types.ObjectId | null;
	inspectionId: mongoose.Types.ObjectId;
	amount: number;
	platformFee: number;
	amountMinor: number;
	inspectionAmountMinor: number;
	serviceFeeMinor: number;
	urgentFeeMinor: number;
	platformCommissionPercent: number;
	platformCommissionAmountMinor: number;
	inspectorPayableAmountMinor: number;
	currency: string;
	paystackRef: string;
	paystackTransactionId?: string;
	status: "pending" | "paid" | "failed";
	payoutStatus: PayoutStatus;
	transferReference?: string;
	paystackTransferCode?: string;
	payoutFailureReason?: string;
	payoutEligibleAt?: Date;
	paidAt?: Date;
	releasedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

const schema = new Schema<ITransaction>(
	{
		buyerId: {
			type: Schema.Types.ObjectId,
			ref: "users",
			required: true,
			index: true,
		},
		inspectorId: { type: Schema.Types.ObjectId, ref: "users", index: true },
		inspectionId: {
			type: Schema.Types.ObjectId,
			ref: "inspections",
			required: true,
			index: true,
		},
		amount: { type: Number, required: true },
		platformFee: { type: Number, default: 2500 },
		amountMinor: { type: Number, required: true, min: 0 },
		inspectionAmountMinor: { type: Number, required: true, min: 0 },
		serviceFeeMinor: { type: Number, default: 0, min: 0 },
		urgentFeeMinor: { type: Number, default: 0, min: 0 },
		platformCommissionPercent: { type: Number, required: true, min: 0, max: 100 },
		platformCommissionAmountMinor: { type: Number, required: true, min: 0 },
		inspectorPayableAmountMinor: { type: Number, required: true, min: 0 },
		currency: { type: String, default: "NGN" },
		paystackRef: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		status: {
			type: String,
			enum: ["pending", "paid", "failed"],
			default: "pending",
		},
		paystackTransactionId: { type: String, index: true },
		payoutStatus: {
			type: String,
			enum: ["not_eligible", "held", "held_dispute", "eligible", "action_required", "processing", "failed", "manual_attention", "released", "refunded"],
			default: "not_eligible",
		},
		transferReference: { type: String, unique: true, sparse: true, index: true },
		paystackTransferCode: String,
		payoutFailureReason: String,
		payoutEligibleAt: Date,
		paidAt: Date,
		releasedAt: Date,
	},
	{ timestamps: true },
);

schema.index({ inspectionId: 1, status: 1 });

const COLLECTION = "transactions";
export const Transaction =
	(mongoose.models[COLLECTION] as mongoose.Model<ITransaction>) ||
	mongoose.model<ITransaction>(COLLECTION, schema);

function timer(method: string, op: IOperationType = IOperationType.Read) {
	return databaseResponseTimeHistogram.startTimer({
		operation: op,
		collection: COLLECTION,
		method,
	});
}

export async function createTransactionDB(
	payload: Partial<ITransaction>,
	session?: mongoose.ClientSession,
): Promise<ITransaction> {
	const stop = timer("createTransactionDB", IOperationType.Create);
	const arr = await Transaction.create([payload], { session });
	stop({ success: "true" });
	return arr[0];
}

export async function getTransactionByRefDB(
	ref: string,
): Promise<ITransaction | null> {
	const stop = timer("getTransactionByRefDB");
	const t = await Transaction.findOne({ paystackRef: ref }).exec();
	stop({ success: "true" });
	return t;
}

export async function getTransactionByIdDB(id: string): Promise<ITransaction | null> {
	if (!mongoose.isValidObjectId(id)) return null;
	return Transaction.findById(id).exec();
}

export async function getTransactionByTransferRefDB(ref: string): Promise<ITransaction | null> {
	return Transaction.findOne({ transferReference: ref }).exec();
}

export async function getPaidTransactionForInspectionDB(inspectionId: string): Promise<ITransaction | null> {
	return Transaction.findOne({ inspectionId, status: "paid" }).exec();
}

export async function getLatestTransactionForInspectionDB(inspectionId: string): Promise<ITransaction | null> {
	return Transaction.findOne({ inspectionId }).sort({ createdAt: -1 }).exec();
}

export async function listTransactionsForInspectorDB(
	inspectorId: string,
): Promise<ITransaction[]> {
	const stop = timer("listTransactionsForInspectorDB");
	const items = await Transaction.find({ inspectorId })
		.sort({ createdAt: -1 })
		.exec();
	stop({ success: "true" });
	return items;
}

export async function updateTransactionDB(
	id: string,
	patch: Partial<ITransaction>,
	session?: mongoose.ClientSession,
): Promise<ITransaction | null> {
	const stop = timer("updateTransactionDB", IOperationType.Update);
	const t = await Transaction.findOneAndUpdate(
		{ _id: id },
		{ $set: patch },
		{ returnDocument: "after", session },
	).exec();
	stop({ success: "true" });
	return t;
}

export async function transitionTransactionDB(
	id: string,
	filter: Record<string, unknown>,
	patch: Partial<ITransaction>,
): Promise<ITransaction | null> {
	return Transaction.findOneAndUpdate(
		{ _id: id, ...filter },
		{ $set: patch },
		{ returnDocument: "after" },
	).exec();
}

export async function findTransactionsByInspectionDB(inspectionId: string): Promise<ITransaction[]> {
	return Transaction.find({ inspectionId }).sort({ createdAt: -1 }).exec();
}

export async function platformRevenueSumDB(since: Date): Promise<number> {
	const stop = timer("platformRevenueSumDB", IOperationType.Aggregate);
	const agg = await Transaction.aggregate([
		{ $match: { status: "paid", paidAt: { $gte: since } } },
		{ $group: { _id: null, total: { $sum: "$platformCommissionAmountMinor" } } },
	]).exec();
	stop({ success: "true" });
	return ((agg[0]?.total as number | undefined) ?? 0) / 100;
}

export async function financialSummaryDB(since: Date) {
	const rows = await Transaction.aggregate([
		{ $match: { status: "paid", paidAt: { $gte: since } } },
		{ $group: {
			_id: null,
			totalPaidMinor: { $sum: "$amountMinor" },
			commissionMinor: { $sum: "$platformCommissionAmountMinor" },
			inspectorPayableMinor: { $sum: "$inspectorPayableAmountMinor" },
			paidOutMinor: { $sum: { $cond: [{ $eq: ["$payoutStatus", "released"] }, "$inspectorPayableAmountMinor", 0] } },
			pendingPayoutMinor: { $sum: { $cond: [{ $in: ["$payoutStatus", ["not_eligible", "held", "held_dispute", "eligible", "action_required", "processing", "failed", "manual_attention"]] }, "$inspectorPayableAmountMinor", 0] } },
			failedPayouts: { $sum: { $cond: [{ $eq: ["$payoutStatus", "failed"] }, 1, 0] } },
		} },
	]).exec();
	const row = rows[0] ?? {};
	return {
		totalPaidNaira: (row.totalPaidMinor ?? 0) / 100,
		commissionNaira: (row.commissionMinor ?? 0) / 100,
		inspectorPayableNaira: (row.inspectorPayableMinor ?? 0) / 100,
		paidOutNaira: (row.paidOutMinor ?? 0) / 100,
		pendingPayoutNaira: (row.pendingPayoutMinor ?? 0) / 100,
		failedPayouts: row.failedPayouts ?? 0,
	};
}

export async function inspectorEarningsDB(inspectorId: string) {
	const stop = timer("inspectorEarningsDB", IOperationType.Aggregate);
	const objId = new mongoose.Types.ObjectId(inspectorId);
	const agg = await Transaction.aggregate([
		{ $match: { inspectorId: objId, status: "paid" } },
		{
			$group: {
				_id: "$payoutStatus",
				total: { $sum: "$inspectorPayableAmountMinor" },
				count: { $sum: 1 },
			},
		},
	]).exec();
	stop({ success: "true" });

	let released = 0;
	let held = 0;
	let totalCount = 0;
	for (const row of agg) {
		totalCount += row.count;
		if (row._id === "released") released += row.total / 100;
		if (["not_eligible", "held", "held_dispute", "eligible", "action_required", "processing", "failed", "manual_attention"].includes(row._id)) held += row.total / 100;
	}
	return { released, held, totalCount };
}
