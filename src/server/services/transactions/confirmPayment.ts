import "server-only";
import { ErrForbidden, ErrInvalidAction } from "@/server/constants/errors";
import {
	getTransactionByRefDB,
	type ITransaction,
	transitionTransactionDB,
} from "@/server/models/transactions";
import { verifyPaystackPayment } from "./paystack";
import invalidateCacheKeys from "./utils/invalidateCacheKeys";
import { isVerifiedPaymentExact } from "./validatePayment";

export default async function confirmPayment({
	reference,
	buyerId,
}: {
	reference: string;
	buyerId?: string;
}): Promise<ITransaction> {
	const transaction = await getTransactionByRefDB(reference);
	if (!transaction) throw ErrInvalidAction;
	if (buyerId && transaction.buyerId.toString() !== buyerId)
		throw ErrForbidden;
	if (transaction.status === "paid") return transaction;
	if (transaction.status !== "pending") throw ErrInvalidAction;

	const provider = await verifyPaystackPayment(reference, {
		amount: transaction.amountMinor,
		currency: transaction.currency,
	});
	if (
		!isVerifiedPaymentExact(
			{
				reference,
				amountMinor: transaction.amountMinor,
				currency: transaction.currency,
			},
			provider,
		)
	)
		throw ErrInvalidAction;

	const paid = await transitionTransactionDB(
		transaction._id.toString(),
		{ status: "pending" },
		{
			status: "paid",
			payoutStatus: "held",
			paidAt: new Date(),
			paystackTransactionId: String(provider.id),
		},
	);
	if (!paid) {
		const current = await getTransactionByRefDB(reference);
		if (current?.status === "paid") return current;
		throw ErrInvalidAction;
	}
	const inspectorId = paid.inspectorId?.toString();
	if (inspectorId) await invalidateCacheKeys({ inspectorId });
	return paid;
}
