import { notFound } from "next/navigation";
import { InspectionWrapper } from "@/libs/InspectionWrapper";
import { connectMongoDB } from "@/server/databases/mongoDB";
import { resolveShareNonce } from "@/server/services/inspections";

export const runtime = "nodejs";
export const metadata = { title: "Shared report · Chekka" };

export default async function SharedReportPage({
	params,
}: {
	params: Promise<{ nonce: string }>;
}) {
	const { nonce } = await params;
	await connectMongoDB();
	const inspection = await resolveShareNonce({ nonce });
	if (!inspection) notFound();

	return (
		<InspectionWrapper id={nonce} sharedInspection={inspection} />
	);
}
