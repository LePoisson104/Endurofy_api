import cron from "node-cron";
import cleanupServices from "../services/cleanup.services";
import { logger } from "../utils/logger";

/**
 * Schedule cleanup of unverified accounts
 * Runs every day at midnight (00:00)
 * Cron expression: '0 0 * * *'
 * - 0: At minute 0
 * - 0: At hour 0
 * - *: Every day
 * - *: Every month
 * - *: Every day of the week
 */
export const scheduleCleanup = (): void => {
  cron.schedule("0 1 * * *", async () => {
    try {
      await logger.info("Starting cleanup of unverified accounts...");
      const deletedCount = await cleanupServices.cleanupUnverifiedAccounts();
      await logger.info(
        `Cleanup completed. Deleted ${deletedCount} unverified accounts.`
      );
    } catch (error) {
      await logger.error(error as Error);
    }
  });
};
