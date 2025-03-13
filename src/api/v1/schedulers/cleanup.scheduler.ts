import cron from "node-cron";
import cleanupServices from "../services/cleanup.services";
import Logger from "../utils/logger";
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
      await Logger.logEvents(
        "Initializing cleanup of unverified accounts",
        "info.log"
      );
      const deletedCount = await cleanupServices.cleanupUnverifiedAccounts();
      await Logger.logEvents(
        `Successfully cleaned up ${deletedCount} unverified accounts`,
        "info.log"
      );
    } catch (error) {
      await Logger.logEvents(
        `Error cleaning up unverified accounts: ${error}`,
        "errLog.log"
      );
    }
  });
};
