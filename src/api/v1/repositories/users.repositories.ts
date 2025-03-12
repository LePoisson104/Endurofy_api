import pool from "../../../config/db.config";
import { User, UserProfile } from "../interfaces/db.models";
import { AppError } from "../middlewares/error.handlers";
import { logger } from "../utils/logger";

const queryGetUsersInfo = async (
  userId: string
): Promise<{ user: User; userProfile: UserProfile }> => {
  const userQuery =
    "SELECT email, first_name, last_name, updated_at FROM users WHERE user_id = ?";
  const userProfileQuery =
    "SELECT profile_status, birth_date, weight, weight_unit, weight_goal, weight_goal_unit, height, height_unit, gender, goal, activity_level, BMR, updated_at FROM users_profile WHERE user_id = ?";

  try {
    // Execute queries concurrently for efficiency
    const [userQueryResult, userProfileQueryResult] = await Promise.all([
      pool.execute(userQuery, [userId]),
      pool.execute(userProfileQuery, [userId]),
    ]);

    const users = userQueryResult[0] as User[];
    const usersProfiles = userProfileQueryResult[0] as UserProfile[];

    // Check if user exists
    if (users.length === 0) {
      throw new AppError("User not found", 404);
    }

    return {
      user: users[0], // User data
      userProfile: usersProfiles[0], // User profile (or null if not found)
    };
  } catch (err: any) {
    if (err instanceof AppError) throw err;
    await logger.error(`Error getting user's info: ${err.message}`);
    throw new AppError("Database error while fetching user info", 500);
  }
};

const queryUpdateUsersName = async (
  userId: string,
  firstName: string,
  lastName: string,
  updatedAt: Date
): Promise<any> => {
  const query =
    "UPDATE users SET first_name = ?, last_name = ?, updated_at = ? WHERE user_id = ?";
  try {
    const [result] = await pool.execute(query, [
      firstName,
      lastName,
      updatedAt,
      userId,
    ]);
    return result;
  } catch (err: any) {
    await logger.error(`Error updating user's name: ${err.message}`);
    throw new AppError("Database error while updating user's name", 500);
  }
};

const queryInitiateEmailChange = async (
  userId: string,
  newEmail: string,
  changeToken: string,
  tokenExpiresAt: Date
): Promise<void> => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Check if new email is already in use
    const [existingUsers] = await connection.execute(
      "SELECT user_id FROM users WHERE email = ? OR pending_email = ?",
      [newEmail, newEmail]
    );

    if ((existingUsers as any[]).length > 0) {
      throw new AppError("Email already in use", 409);
    }

    // Update user with pending email change
    await connection.execute(
      `UPDATE users 
       SET pending_email = ?, 
           email_change_token = ?,
           token_expires_at = ?,
           updated_at = NOW() 
       WHERE user_id = ?`,
      [newEmail, changeToken, tokenExpiresAt, userId]
    );

    await connection.commit();
  } catch (err: any) {
    await connection.rollback();
    if (err instanceof AppError) throw err;
    await logger.error(`Error initiating email change: ${err.message}`);
    throw new AppError("Database error while initiating email change", 500);
  } finally {
    connection.release();
  }
};

const queryConfirmEmailChange = async (
  userId: string,
  token: string
): Promise<void> => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Get user's pending email change
    const [users] = await connection.execute(
      `SELECT pending_email, email_change_token, token_expires_at 
       FROM users 
       WHERE user_id = ?`,
      [userId]
    );

    const user = (users as any[])[0];

    if (!user?.pending_email || !user?.email_change_token) {
      throw new AppError("No pending email change found", 404);
    }

    if (user.email_change_token !== token) {
      throw new AppError("Invalid verification token", 400);
    }

    if (new Date(user.token_expires_at) < new Date()) {
      throw new AppError("Verification token has expired", 400);
    }

    // Update email and clear pending change
    await connection.execute(
      `UPDATE users 
       SET email = pending_email,
           pending_email = NULL,
           email_change_token = NULL,
           token_expires_at = NULL,
           updated_at = NOW()
       WHERE user_id = ?`,
      [userId]
    );

    await connection.commit();
  } catch (err: any) {
    await connection.rollback();
    if (err instanceof AppError) throw err;
    await logger.error(`Error confirming email change ${err.message}`);
    throw new AppError("Database error while confirming email change", 500);
  } finally {
    connection.release();
  }
};

const queryUpdateUsersPassword = async (
  userId: string,
  hashedPassword: string,
  updateAt: Date
): Promise<any> => {
  const query =
    "UPDATE users SET hashed_password = ?, updated_at = ? WHERE user_id = ?";
  try {
    const [result] = await pool.execute(query, [
      hashedPassword,
      updateAt,
      userId,
    ]);
    return result;
  } catch (err: any) {
    await logger.error(`Error updating user's password: ${err.message}`);
    throw new AppError("Database error while updating user's password", 500);
  }
};

const queryDeleteUser = async (userId: string): Promise<any> => {
  const query = "DELETE FROM users WHERE user_id = ?";
  try {
    const [result] = await pool.execute(query, [userId]);
    return result;
  } catch (err: any) {
    await logger.error(`Error deleting user: ${err.message}`);
    throw new AppError("Database error while deleting user", 500);
  }
};

export default {
  queryGetUsersInfo,
  queryDeleteUser,
  queryUpdateUsersName,
  queryUpdateUsersPassword,
  queryInitiateEmailChange,
  queryConfirmEmailChange,
};
