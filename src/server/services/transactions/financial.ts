import type { IInspection } from "@/server/models/inspections";

export interface IFinancialSnapshot {
	amountMinor: number;
	inspectionAmountMinor: number;
	serviceFeeMinor: number;
	urgentFeeMinor: number;
	platformCommissionPercent: number;
	platformCommissionAmountMinor: number;
	inspectorPayableAmountMinor: number;
	currency: "NGN";
}

export function calculateFinancialSnapshot(
	inspection: Pick<IInspection, "price" | "platformFee" | "urgent">,
	platformCommissionPercent: number,
): IFinancialSnapshot {
	const inspectionAmountMinor = Math.round(inspection.price * 100);
	const serviceFeeMinor = Math.round(inspection.platformFee * 100);
	const urgentFeeMinor = inspection.urgent ? Math.min(inspectionAmountMinor, 10_000 * 100) : 0;
	const amountMinor = inspectionAmountMinor + serviceFeeMinor;
	const platformCommissionAmountMinor = Math.round(
		(amountMinor * platformCommissionPercent) / 100,
	);
	return {
		amountMinor,
		inspectionAmountMinor,
		serviceFeeMinor,
		urgentFeeMinor,
		platformCommissionPercent,
		platformCommissionAmountMinor,
		inspectorPayableAmountMinor: amountMinor - platformCommissionAmountMinor,
		currency: "NGN",
	};
}
