import pool from "../../../config/db.config";
import { AppError } from "../middlewares/error.handlers";
import { logger } from "../utils/logger";

/**
 * Deletes unverified accounts that are older than 24 hours
 * This includes:
 * 1. Users who haven't verified their email within 24 hours
 * 2. Their associated OTP records
 * @returns The number of deleted accounts
 */
const cleanupUnverifiedAccounts = async (): Promise<number> => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Get unverified users older than 24 hours
    const [unverifiedUsers] = await connection.execute(
      `SELECT user_id, email FROM users 
       WHERE verified = 0 
       AND created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)`
    );

    if (!(unverifiedUsers as any[]).length) {
      await connection.commit();
      return 0;
    }

    // Delete their OTP records first (due to foreign key constraints)
    await connection.execute(
      `DELETE FROM otp 
       WHERE email IN (
         SELECT email FROM users 
         WHERE verified = 0 
         AND created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)
       )`
    );

    // Delete the unverified users
    const [result] = await connection.execute(
      `DELETE FROM users 
       WHERE verified = 0 
       AND created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)`
    );

    await connection.commit();
    return (result as any).affectedRows;
  } catch (err) {
    await connection.rollback();
    await logger.error(err as Error);
    throw new AppError("Error during cleanup operation", 500);
  } finally {
    connection.release();
  }
};

export default { cleanupUnverifiedAccounts };
