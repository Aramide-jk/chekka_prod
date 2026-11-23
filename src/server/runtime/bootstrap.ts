import "server-only";
import { startCronJobs, stopCronJobs } from "../constants/cron";
import { connectMongoDB, disconnectMongoDB } from "../databases";
import { disconnectRedis } from "../databases/redis";

declare global {
	// eslint-disable-next-line no-var
	var __chekkaBootstrapped: boolean | undefined;
}

/**
 * One-time process bootstrap — warms the MongoDB connection and starts
 * cron sweeps for overdue reports, payout release, and token cleanup.
 */
export async function bootstrap(): Promise<void> {
	if (global.__chekkaBootstrapped) return;
	global.__chekkaBootstrapped = true;

	try {
		await connectMongoDB();
	} catch (error) {
		console.error("[chekka:bootstrap] MongoDB connect failed:", error);
	}

	startCronJobs();

	const shutdown = async () => {
		stopCronJobs();
		try {
			await disconnectMongoDB();
		} catch {
			// no-op
		}
		try {
			await disconnectRedis();
		} catch {
			// no-op
		}
	};

	process.once("SIGINT", () => {
		shutdown().finally(() => process.exit(0));
	});
	process.once("SIGTERM", () => {
		shutdown().finally(() => process.exit(0));
	});
}
