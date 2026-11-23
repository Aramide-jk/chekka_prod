import "server-only";
import { CronJob } from "cron";
import { hasBlockingDisputeDB } from "../models/disputes";
import { getInspectionByIdDB, listOverdueInspectionsDB } from "../models/inspections";
import { Transaction, transitionTransactionDB } from "../models/transactions";
import { User } from "../models/users";
import { remindInspector } from "../services/admin";
import getSiteConfig from "../services/siteConfigs/getSiteConfig";
import { initiatePayoutForTransaction } from "../services/transactions/payout";

/**
 * Sweeps all inspections that are past their report deadline and nudges the assigned inspector.
 */
export async function sweepOverdueInspections(): Promise<number> {
	try {
		const overdue = await listOverdueInspectionsDB(new Date());
		let count = 0;
		for (const inspection of overdue) {
			try {
				await remindInspector({ id: inspection._id.toString() });
				count++;
			} catch (err) {
				console.error(
					`[cron:sweepOverdueInspections] Failed to remind inspector for ${inspection._id}:`,
					err,
				);
			}
		}
		if (count > 0) {
			console.log(
				`[cron:sweepOverdueInspections] Reminded ${count} inspector(s) with overdue reports.`,
			);
		}
		return count;
	} catch (error) {
		console.error("[cron:sweepOverdueInspections] Error during sweep:", error);
		return 0;
	}
}

/**
 * Sweeps all paid transactions held past the dispute clearance window (default 48h)
 * and triggers automated Paystack payout for eligible inspections without active disputes.
 */
export async function sweepEligiblePayouts(): Promise<number> {
	try {
		const config = await getSiteConfig();
		const disputeWindowHours =
			config?.inspections?.disputeAutoEscalateHours || 48;
		const cutoff = new Date(Date.now() - disputeWindowHours * 60 * 60 * 1000);

		const heldTransactions = await Transaction.find({
			status: "paid",
			payoutStatus: { $in: ["held", "action_required"] },
		}).exec();

		let releasedCount = 0;
		for (const tx of heldTransactions) {
			try {
				const inspection = await getInspectionByIdDB(
					tx.inspectionId.toString(),
				);
				if (
					!inspection ||
					inspection.status !== "completed" ||
					!inspection.reportLockedAt
				) {
					continue;
				}
				if (new Date(inspection.reportLockedAt) > cutoff) {
					// Still within the dispute hold window
					continue;
				}
				const hasDispute = await hasBlockingDisputeDB(
					inspection._id.toString(),
				);
				if (hasDispute) {
					continue;
				}

				// Transition transaction to eligible and trigger payout transfer
				const eligible = await transitionTransactionDB(
					tx._id.toString(),
					{
						status: "paid",
						payoutStatus: {
							$in: [
								"held",
								"not_eligible",
								"action_required",
								"failed",
							],
						},
					},
					{ payoutStatus: "eligible", payoutEligibleAt: new Date() },
				);
				if (eligible) {
					await initiatePayoutForTransaction(eligible._id.toString());
					releasedCount++;
				}
			} catch (err) {
				console.error(
					`[cron:sweepEligiblePayouts] Error processing payout for transaction ${tx._id}:`,
					err,
				);
			}
		}
		if (releasedCount > 0) {
			console.log(
				`[cron:sweepEligiblePayouts] Initiated ${releasedCount} eligible payout(s).`,
			);
		}
		return releasedCount;
	} catch (error) {
		console.error("[cron:sweepEligiblePayouts] Error during sweep:", error);
		return 0;
	}
}

/**
 * Cleans expired OTPs in Redis and purges expired invite tokens in MongoDB.
 */
export async function cleanExpiredTokens(): Promise<{
	expiredUsersCleaned: number;
	redisKeysPurged: number;
}> {
	let expiredUsersCleaned = 0;
	let redisKeysPurged = 0;

	try {
		// Clean up expired manager invite tokens in MongoDB
		const now = new Date();
		const result = await User.updateMany(
			{
				inviteTokenExpiresAt: { $lt: now },
				status: "pending",
				inviteToken: { $exists: true },
			},
			{
				$unset: { inviteToken: 1 },
			},
		);
		expiredUsersCleaned = result.modifiedCount || 0;

		// Clean up any untracked or expired Redis keys matching pattern
		try {
			const { Redis } = await import("../databases/redis");
			if (Redis) {
				const keys = await Redis.keys("auth:password-reset:*");
				for (const key of keys) {
					const ttl = await Redis.ttl(key);
					// If TTL is -1 (key has no expiration set), remove it
					if (ttl === -1) {
						await Redis.del(key);
						redisKeysPurged++;
					}
				}
			}
		} catch {
			// Redis not reachable; ignore
		}
		console.log(
			`[cron:cleanExpiredTokens] Cleaned ${expiredUsersCleaned} expired invite(s) and ${redisKeysPurged} Redis key(s).`,
		);
	} catch (error) {
		console.error("[cron:cleanExpiredTokens] Error during cleanup:", error);
	}

	return { expiredUsersCleaned, redisKeysPurged };
}

// Global reference holders for jobs
let overdueJob: CronJob | null = null;
let payoutsJob: CronJob | null = null;
let cleanTokensJob: CronJob | null = null;

export function startCronJobs(): void {
	if (process.env.DISABLE_CRON === "1") {
		console.log("[chekka:cron] Background cron jobs disabled via DISABLE_CRON=1");
		return;
	}

	if (overdueJob && payoutsJob && cleanTokensJob) return;

	try {
		// Every hour on the hour (e.g. 10:00, 11:00)
		overdueJob = new CronJob("0 * * * *", () => {
			sweepOverdueInspections().catch(() => {});
		});
		overdueJob.start();

		// Every hour at minute 15 (e.g. 10:15, 11:15)
		payoutsJob = new CronJob("15 * * * *", () => {
			sweepEligiblePayouts().catch(() => {});
		});
		payoutsJob.start();

		// Daily at 02:00 AM
		cleanTokensJob = new CronJob("0 2 * * *", () => {
			cleanExpiredTokens().catch(() => {});
		});
		cleanTokensJob.start();

		console.log(
			"[chekka:cron] Cron jobs started: overdue sweep (hourly), payouts sweep (hourly), tokens cleaner (daily).",
		);
	} catch (err) {
		console.error("[chekka:cron] Failed to start cron jobs:", err);
	}
}

export function stopCronJobs(): void {
	if (overdueJob) {
		overdueJob.stop();
		overdueJob = null;
	}
	if (payoutsJob) {
		payoutsJob.stop();
		payoutsJob = null;
	}
	if (cleanTokensJob) {
		cleanTokensJob.stop();
		cleanTokensJob = null;
	}
	console.log("[chekka:cron] Cron jobs stopped.");
}
