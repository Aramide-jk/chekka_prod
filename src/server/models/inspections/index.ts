import "server-only";
import mongoose, { type Document, Schema } from "mongoose";
import {
	databaseResponseTimeHistogram,
	IOperationType,
} from "@/server/metrics";
import type {
	ChecklistStatus,
	InspectionStatus,
	InspectionType,
	InspectionVerdict,
} from "@/server/types";

export interface IChecklistItem {
	label: string;
	status: ChecklistStatus;
	comment?: string;
}

export interface IReport {
	overview: {
		year?: number;
		make?: string;
		model?: string;
		mileage?: string;
		transmission?: string;
		vin?: string;
		interiorType?: string;
		interiorColor?: string;
		bodyColor?: string;
		engine?: string;
		driveType?: string;
		fuelType?: string;
	};
	exterior: IChecklistItem[];
	interior: IChecklistItem[];
	mechanical: IChecklistItem[];
	roadTest: IChecklistItem[];
	verdict: InspectionVerdict;
	summary: {
		passed: number;
		minor: number;
		serious: number;
		written: string;
		fixes: Array<{ label: string; priority: "Low" | "Medium" | "High" }>;
	};
}

export interface IInspection extends Document {
	_id: mongoose.Types.ObjectId;
	buyerId: mongoose.Types.ObjectId;
	inspectorId?: mongoose.Types.ObjectId | null;
	assignedInspectorId?: mongoose.Types.ObjectId | null;
	inspectionType: InspectionType;
	status: InspectionStatus;
	car: {
		make: string;
		model: string;
		year: number;
		color?: string;
		sellerType: "dealership" | "private";
		city: string;
		address: string;
		sellerContact?: string;
		notes?: string;
	};
	// The booking buyer's own contact details, captured at booking time so the
	// inspector and admin can reach them to coordinate the visit. Distinct from
	// the seller's contact (which lives on `car.sellerContact`).
	buyerContact?: {
		name?: string;
		phone?: string;
	};
	// Urgent jobs are prioritised in the inspector pool and carry a surcharge.
	urgent?: boolean;
	price: number;
	platformFee: number;
	scheduledFor?: Date;
	slot?: string;
	currentSection?: string;
	assignedAt?: Date;
	acceptedAt?: Date;
	sellerContactedAt?: Date;
	startedAt?: Date;
	completedPhysicalAt?: Date;
	reportDeadline?: Date;
	completedAt?: Date;
	reportLockedAt?: Date;
	report?: IReport;
	// The buyer's rating of the inspector for this job (1–5), set after the
	// inspection completes. Drives the inspector's aggregate profile rating.
	rating?: {
		score: number;
		comment?: string;
		ratedAt: Date;
	};
	photoCount: number;
	deleted: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const checklistItemSchema = new Schema<IChecklistItem>(
	{
		label: { type: String, required: true },
		status: {
			type: String,
			enum: ["good", "minor", "serious", "n/a"],
			required: true,
		},
		comment: { type: String },
	},
	{ _id: false },
);

const reportSchema = new Schema<IReport>(
	{
		overview: {
			year: Number,
			make: String,
			model: String,
			mileage: String,
			transmission: String,
			vin: String,
			interiorType: String,
			interiorColor: String,
			bodyColor: String,
			engine: String,
			driveType: String,
			fuelType: String,
		},
		exterior: { type: [checklistItemSchema], default: [] },
		interior: { type: [checklistItemSchema], default: [] },
		mechanical: { type: [checklistItemSchema], default: [] },
		roadTest: { type: [checklistItemSchema], default: [] },
		verdict: {
			type: String,
			enum: ["good", "caution", "danger"],
			required: true,
		},
		summary: {
			passed: { type: Number, default: 0 },
			minor: { type: Number, default: 0 },
			serious: { type: Number, default: 0 },
			written: { type: String, default: "" },
			fixes: {
				type: [
					new Schema(
						{
							label: String,
							priority: {
								type: String,
								enum: ["Low", "Medium", "High"],
							},
						},
						{ _id: false },
					),
				],
				default: [],
			},
		},
	},
	{ _id: false },
);

const inspectionSchema = new Schema<IInspection>(
	{
		buyerId: {
			type: Schema.Types.ObjectId,
			ref: "users",
			required: true,
			index: true,
		},
		inspectorId: {
			type: Schema.Types.ObjectId,
			ref: "users",
			index: true,
		},
		assignedInspectorId: {
			type: Schema.Types.ObjectId,
			ref: "users",
			index: true,
		},
		inspectionType: {
			type: String,
			enum: ["standard", "premium", "special_request"],
			required: true,
		},
		status: {
			type: String,
			enum: [
				"submitted",
				"assigned",
				"declined",
				"scheduled",
				"in_progress",
				"report_processing",
				"completed",
			],
			default: "submitted",
			index: true,
		},
		car: {
			make: { type: String, required: true },
			model: { type: String, required: true },
			year: { type: Number, required: true },
			color: String,
			sellerType: {
				type: String,
				enum: ["dealership", "private"],
				required: true,
			},
			city: { type: String, required: true },
			address: { type: String, required: true },
			sellerContact: String,
			notes: String,
		},
		buyerContact: {
			name: String,
			phone: String,
		},
		urgent: { type: Boolean, default: false },
		price: { type: Number, required: true },
		platformFee: { type: Number, default: 2500 },
		scheduledFor: { type: Date },
		slot: { type: String },
		currentSection: { type: String },
		assignedAt: { type: Date },
		acceptedAt: { type: Date },
		sellerContactedAt: { type: Date },
		startedAt: { type: Date },
		completedPhysicalAt: { type: Date },
		reportDeadline: { type: Date },
		completedAt: { type: Date },
		reportLockedAt: { type: Date },
		report: { type: reportSchema },
		rating: {
			type: new Schema(
				{
					score: { type: Number, min: 1, max: 5, required: true },
					comment: { type: String },
					ratedAt: { type: Date, default: Date.now },
				},
				{ _id: false },
			),
			default: undefined,
		},
		photoCount: { type: Number, default: 0 },
		deleted: { type: Boolean, default: false, select: false },
	},
	{ timestamps: true },
);

inspectionSchema.index({ status: 1, scheduledFor: 1 });
inspectionSchema.index({ buyerId: 1, status: 1 });
inspectionSchema.index({ inspectorId: 1, status: 1 });
// Enforce availability at the database boundary so concurrent requests
// cannot reserve the same inspector/date/slot. A decline releases the slot.
inspectionSchema.index(
	{ assignedInspectorId: 1, scheduledFor: 1, slot: 1 },
	{
		unique: true,
		partialFilterExpression: {
			deleted: false,
			assignedInspectorId: { $exists: true },
			scheduledFor: { $exists: true },
			slot: { $type: "string" },
			status: {
				$in: [
					"assigned",
					"scheduled",
					"in_progress",
					"report_processing",
					"completed",
				],
			},
		},
		name: "unique_active_inspector_slot",
	},
);

const COLLECTION = "inspections";
export const Inspection =
	(mongoose.models[COLLECTION] as mongoose.Model<IInspection>) ||
	mongoose.model<IInspection>(COLLECTION, inspectionSchema);

function timer(method: string, op: IOperationType = IOperationType.Read) {
	return databaseResponseTimeHistogram.startTimer({
		operation: op,
		collection: COLLECTION,
		method,
	});
}

export async function createInspectionDB(
	payload: Partial<IInspection>,
	session?: mongoose.ClientSession,
): Promise<IInspection> {
	const stop = timer("createInspectionDB", IOperationType.Create);
	const arr = await Inspection.create([payload], { session });
	stop({ success: "true" });
	return arr[0];
}

export async function getInspectionByIdDB(
	id: string,
): Promise<IInspection | null> {
	const stop = timer("getInspectionByIdDB");
	if (!mongoose.isValidObjectId(id)) {
		stop({ success: "false" });
		return null;
	}
	const i = await Inspection.findOne({ _id: id, deleted: false }).exec();
	stop({ success: "true" });
	return i;
}

export async function listInspectionsForBuyerDB(
	buyerId: string,
	filter: { status?: InspectionStatus } = {},
	limit = 20,
	offset = 0,
): Promise<IInspection[]> {
	const stop = timer("listInspectionsForBuyerDB");
	const query: Record<string, unknown> = { buyerId, deleted: false };
	if (filter.status) query.status = filter.status;
	const items = await Inspection.find(query)
		.sort({ createdAt: -1 })
		.skip(offset)
		.limit(limit)
		.exec();
	stop({ success: "true" });
	return items;
}

export async function listInspectionsForInspectorDB(
	inspectorId: string,
	filter: { status?: InspectionStatus } = {},
	limit = 20,
	offset = 0,
): Promise<IInspection[]> {
	const stop = timer("listInspectionsForInspectorDB");
	const query: Record<string, unknown> = {
		$or: [{ inspectorId }, { assignedInspectorId: inspectorId }],
		deleted: false,
	};
	if (filter.status) query.status = filter.status;
	// Once an inspector declines, the job goes back into the pool — they
	// shouldn't keep seeing it in their own queue.
	else query.status = { $ne: "declined" };
	const items = await Inspection.find(query)
		.sort({ createdAt: -1 })
		.skip(offset)
		.limit(limit)
		.exec();
	stop({ success: "true" });
	return items;
}

export async function updateInspectionDB(
	id: string,
	patch: Partial<IInspection>,
	session?: mongoose.ClientSession,
	expectedStatus?: InspectionStatus,
): Promise<IInspection | null> {
	const stop = timer("updateInspectionDB", IOperationType.Update);
	const i = await Inspection.findOneAndUpdate(
		{
			_id: id,
			deleted: false,
			...(expectedStatus ? { status: expectedStatus } : {}),
		},
		{ $set: patch },
		{ returnDocument: "after", session },
	).exec();
	stop({ success: "true" });
	return i;
}

export async function incrementPhotoCountDB(id: string): Promise<void> {
	const stop = timer("incrementPhotoCountDB", IOperationType.Update);
	await Inspection.updateOne({ _id: id }, { $inc: { photoCount: 1 } }).exec();
	stop({ success: "true" });
}

// Decrement, clamped at zero (a soft-deleted photo must never drive the count
// negative if it races with a stale increment).
export async function decrementPhotoCountDB(id: string): Promise<void> {
	const stop = timer("decrementPhotoCountDB", IOperationType.Update);
	await Inspection.updateOne(
		{ _id: id, photoCount: { $gt: 0 } },
		{ $inc: { photoCount: -1 } },
	).exec();
	stop({ success: "true" });
}

export async function listInspectionsByStatusDB(
	status: InspectionStatus,
	limit = 100,
): Promise<IInspection[]> {
	const stop = timer("listInspectionsByStatusDB");
	const items = await Inspection.find({ status, deleted: false })
		.sort({ createdAt: -1 })
		.limit(limit)
		.exec();
	stop({ success: "true" });
	return items;
}

// Admin-side: every inspection regardless of status, with optional status
// filter via `find` — used by /api/admin/inspections when no specific status
// is given.
export async function listAllInspectionsDB(
	filter: { status?: InspectionStatus } = {},
	limit = 100,
	offset = 0,
): Promise<IInspection[]> {
	const stop = timer("listAllInspectionsDB");
	const query: Record<string, unknown> = { deleted: false };
	if (filter.status) query.status = filter.status;
	const items = await Inspection.find(query)
		.sort({ createdAt: -1 })
		.skip(offset)
		.limit(limit)
		.exec();
	stop({ success: "true" });
	return items;
}

export async function countInspectionsDB(
	filter: {
		status?: InspectionStatus | { $in: InspectionStatus[] };
		inspectionType?: string;
		createdAfter?: Date;
	} = {},
): Promise<number> {
	const stop = timer("countInspectionsDB");
	const query: Record<string, unknown> = { deleted: false };
	if (filter.status) query.status = filter.status;
	if (filter.inspectionType) query.inspectionType = filter.inspectionType;
	if (filter.createdAfter) query.createdAt = { $gte: filter.createdAfter };
	const n = await Inspection.countDocuments(query).exec();
	stop({ success: "true" });
	return n;
}

export async function countOverdueInspectionsDB(
	now: Date = new Date(),
): Promise<number> {
	const stop = timer("countOverdueInspectionsDB");
	const n = await Inspection.countDocuments({
		status: "report_processing",
		reportDeadline: { $lt: now },
		deleted: false,
	}).exec();
	stop({ success: "true" });
	return n;
}

export async function listSpecialRequestsDB(
	limit = 100,
): Promise<IInspection[]> {
	const stop = timer("listSpecialRequestsDB");
	const items = await Inspection.find({
		inspectionType: "special_request",
		deleted: false,
	})
		.sort({ createdAt: -1 })
		.limit(limit)
		.exec();
	stop({ success: "true" });
	return items;
}

export async function listOverdueInspectionsDB(
	now: Date = new Date(),
): Promise<IInspection[]> {
	const stop = timer("listOverdueInspectionsDB");
	const items = await Inspection.find({
		status: "report_processing",
		reportDeadline: { $lt: now },
		deleted: false,
	}).exec();
	stop({ success: "true" });
	return items;
}

export async function getBookedSlotsForInspectorDB(
	inspectorId: string,
	from: Date,
	to: Date,
): Promise<Array<{ scheduledFor: Date; slot: string }>> {
	const stop = timer("getBookedSlotsForInspectorDB");
	const items = await Inspection.find(
		{
			$or: [{ inspectorId }, { assignedInspectorId: inspectorId }],
			scheduledFor: { $gte: from, $lte: to },
			status: { $ne: "declined" },
			deleted: false,
		},
		{ scheduledFor: 1, slot: 1 },
	).exec();
	stop({ success: "true" });
	return items.map((i) => ({
		scheduledFor: i.scheduledFor as Date,
		slot: i.slot as string,
	}));
}

// Average buyer rating + count across every rated inspection for an inspector.
// Used to refresh the inspector's aggregate profile rating after a new rating.
export async function aggregateInspectorRatingDB(
	inspectorId: string,
): Promise<{ avg: number; count: number }> {
	const stop = timer("aggregateInspectorRatingDB", IOperationType.Aggregate);
	const objId = new mongoose.Types.ObjectId(inspectorId);
	const agg = await Inspection.aggregate([
		{
			$match: {
				$or: [{ inspectorId: objId }, { assignedInspectorId: objId }],
				"rating.score": { $gte: 1 },
				deleted: false,
			},
		},
		{
			$group: {
				_id: null,
				avg: { $avg: "$rating.score" },
				count: { $sum: 1 },
			},
		},
	]).exec();
	stop({ success: "true" });
	const row = agg[0] as { avg?: number; count?: number } | undefined;
	return { avg: row?.avg ?? 0, count: row?.count ?? 0 };
}

export async function dashboardStatsForBuyerDB(buyerId: string) {
	const stop = timer("dashboardStatsForBuyerDB", IOperationType.Aggregate);
	const agg = await Inspection.aggregate([
		{
			$match: {
				buyerId: new mongoose.Types.ObjectId(buyerId),
				deleted: false,
			},
		},
		{
			$group: {
				_id: "$status",
				count: { $sum: 1 },
				verdicts: { $push: "$report.verdict" },
			},
		},
	]).exec();
	stop({ success: "true" });

	let active = 0;
	let completed = 0;
	let worthBuying = 0;
	let avoided = 0;
	for (const row of agg) {
		if (row._id === "completed") {
			completed += row.count;
			for (const v of row.verdicts) {
				if (v === "good") worthBuying++;
				if (v === "danger") avoided++;
			}
		} else if (
			[
				"submitted",
				"assigned",
				"scheduled",
				"in_progress",
				"report_processing",
			].includes(row._id)
		) {
			active += row.count;
		}
	}
	return { active, completed, worthBuying, avoided };
}

export async function dashboardStatsForInspectorDB(inspectorId: string) {
	const stop = timer(
		"dashboardStatsForInspectorDB",
		IOperationType.Aggregate,
	);
	const objId = new mongoose.Types.ObjectId(inspectorId);
	const agg = await Inspection.aggregate([
		{
			$match: {
				$or: [{ inspectorId: objId }, { assignedInspectorId: objId }],
				deleted: false,
			},
		},
		{ $group: { _id: "$status", count: { $sum: 1 } } },
	]).exec();
	stop({ success: "true" });

	let pending = 0;
	let active = 0;
	let completed = 0;
	for (const row of agg) {
		// `assigned` is the offer window before the inspector accepts; once
		// they accept, status moves to `scheduled` and the row counts as
		// active. `declined` is intentionally excluded from every bucket.
		if (row._id === "submitted" || row._id === "assigned")
			pending += row.count;
		else if (
			["scheduled", "in_progress", "report_processing"].includes(row._id)
		)
			active += row.count;
		else if (row._id === "completed") completed += row.count;
	}
	return { pending, active, completed };
}
