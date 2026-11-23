import "server-only";
import { getTransactionByTransferRefDB, transitionTransactionDB, type ITransaction } from "@/server/models/transactions";

export default async function handleTransferEvent(input: {
	event: "transfer.success" | "transfer.failed" | "transfer.reversed";
	reference: string;
	transferCode?: string;
	reason?: string;
}): Promise<ITransaction | null> {
	const transaction = await getTransactionByTransferRefDB(input.reference);
	if (!transaction) return null;
	if (input.event === "transfer.success") {
		if (transaction.payoutStatus === "released") return transaction;
		return transitionTransactionDB(transaction._id.toString(), { payoutStatus: "processing" }, {
			payoutStatus: "released",
			releasedAt: new Date(),
			paystackTransferCode: input.transferCode ?? transaction.paystackTransferCode,
			payoutFailureReason: undefined,
		});
	}
	if (input.event === "transfer.reversed") {
		if (transaction.payoutStatus === "manual_attention") return transaction;
		return transitionTransactionDB(transaction._id.toString(), {
			payoutStatus: { $in: ["processing", "released"] },
		}, {
			payoutStatus: "manual_attention",
			paystackTransferCode: input.transferCode ?? transaction.paystackTransferCode,
			payoutFailureReason: input.reason || "Paystack transfer was reversed",
		});
	}
	if (transaction.payoutStatus === "released") return transaction;
	return transitionTransactionDB(transaction._id.toString(), { payoutStatus: "processing" }, {
		payoutStatus: "failed",
		paystackTransferCode: input.transferCode ?? transaction.paystackTransferCode,
		payoutFailureReason: input.reason || "Paystack transfer failed",
	});
}
