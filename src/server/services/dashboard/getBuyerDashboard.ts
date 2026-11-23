import "server-only";
import {
	dashboardStatsForBuyer,
	type EnrichedInspection,
	enrichInspections,
	type IBuyerDashboardStats,
	listForBuyer,
} from "../inspections";

export interface IBuyerDashboard {
	stats: IBuyerDashboardStats;
	recent: EnrichedInspection[];
	active: EnrichedInspection[];
}

export default async function getBuyerDashboard({
	buyerId,
}: {
	buyerId: string;
}): Promise<IBuyerDashboard> {
	const [stats, recent, mixed] = await Promise.all([
		dashboardStatsForBuyer({ buyerId }),
		listForBuyer({ buyerId, status: "completed", limit: 5 }),
		listForBuyer({ buyerId, limit: 5 }),
	]);
	const active = mixed.filter(
		(i) => i.status !== "completed" && i.status !== "declined",
	);
	const [enrichedRecent, enrichedActive] = await Promise.all([
		enrichInspections(recent),
		enrichInspections(active),
	]);
	return { stats, recent: enrichedRecent, active: enrichedActive };
}
