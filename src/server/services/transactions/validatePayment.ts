export interface ExpectedPayment {
	reference: string;
	amountMinor: number;
	currency: string;
}

export interface VerifiedPayment {
	status: string;
	reference: string;
	amount: number;
	currency: string;
}

export function isVerifiedPaymentExact(
	expected: ExpectedPayment,
	provider: VerifiedPayment,
): boolean {
	return (
		provider.status === "success" &&
		provider.reference === expected.reference &&
		provider.amount === expected.amountMinor &&
		provider.currency === expected.currency
	);
}
