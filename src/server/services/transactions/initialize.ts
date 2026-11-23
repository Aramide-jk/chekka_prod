import "server-only";
import crypto from "node:crypto";
import { ErrInspectionNotFound, ErrInvalidAction } from "@/server/constants/errors";
import { createTransactionDB, getPaidTransactionForInspectionDB, updateTransactionDB } from "@/server/models/transactions";
import getInspectionById from "../inspections/getInspectionById";
import getSiteConfig from "../siteConfigs/getSiteConfig";
import getUserById from "../users/getUserById";
import { calculateFinancialSnapshot } from "./financial";
import { initializePaystackPayment } from "./paystack";

export interface IInitializeResult {
	transactionId: string;
	reference: string;
	authorizationUrl: string;
	accessCode: string;
}

export default async function initialize({ buyerId, inspectionId }: {
	buyerId: string;
	inspectionId: string;
}): Promise<IInitializeResult> {
	const [inspection, buyer, config, existingPaid] = await Promise.all([
		getInspectionById({ id: inspectionId }),
		getUserById({ id: buyerId }),
		getSiteConfig(),
		getPaidTransactionForInspectionDB(inspectionId),
	]);
	if (!inspection || inspection.buyerId.toString() !== buyerId) throw ErrInspectionNotFound;
	if (
		!buyer ||
		existingPaid ||
		inspection.deleted ||
		(inspection.inspectionType === "special_request" && inspection.price <= 0)
	) throw ErrInvalidAction;

	const snapshot = calculateFinancialSnapshot(
		inspection,
		config.pricing.platformCommissionPercent,
	);
	const reference = `chk_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
	const transaction = await createTransactionDB({
		buyerId: inspection.buyerId,
		inspectionId: inspection._id,
		inspectorId: inspection.inspectorId ?? inspection.assignedInspectorId,
		amount: snapshot.amountMinor / 100,
		platformFee: snapshot.serviceFeeMinor / 100,
		...snapshot,
		paystackRef: reference,
		status: "pending",
		payoutStatus: "not_eligible",
	});

	try {
		const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
		const provider = await initializePaystackPayment({
			email: buyer.email,
			amount: snapshot.amountMinor,
			currency: snapshot.currency,
			reference,
			callbackUrl: `${appUrl}/api/transactions/verify`,
			metadata: { transactionId: transaction._id.toString(), inspectionId },
		});
		return {
			transactionId: transaction._id.toString(),
			reference,
			authorizationUrl: provider.authorization_url,
			accessCode: provider.access_code,
		};
	} catch (error) {
		await updateTransactionDB(transaction._id.toString(), { status: "failed" });
		throw error;
	}
}
