import pool from "../../../config/db.config";
import { User, UserProfile } from "../interfaces/db.models";
import { AppError } from "../middlewares/error.handlers";
import Logger from "../utils/logger";
import { UserProfileUpdatePayload } from "../interfaces/user.interfaces";

const queryGetUsersInfo = async (
  userId: string
): Promise<{ user: User; userProfile: UserProfile }> => {
  const userQuery =
    "SELECT email, first_name, last_name, updated_at, pending_email FROM users WHERE user_id = ?";
  const userProfileQuery =
    "SELECT profile_status, birth_date, starting_weight, starting_weight_unit, current_weight, current_weight_unit, weight_goal, weight_goal_unit, height, height_unit, gender, goal, activity_level, updated_at FROM users_profile WHERE user_id = ?";

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
    await Logger.logEvents(`Error fetching user info: ${err}`, "errLog.log");
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
    await Logger.logEvents(`Error updating user's name: ${err}`, "errLog.log");
    throw new AppError("Database error while updating user's name", 500);
  }
};

const queryUpdateUsersPassword = async (
  userId: string,
  hashedPassword: string,
  updateAt: Date,
  connection?: any
): Promise<any> => {
  const query =
    "UPDATE users SET hashed_password = ?, updated_at = ? WHERE user_id = ?";
  try {
    if (connection) {
      const [result] = await connection.execute(query, [
        hashedPassword,
        updateAt,
        userId,
      ]);
      return result;
    } else {
      const [result] = await pool.execute(query, [
        hashedPassword,
        updateAt,
        userId,
      ]);
      return result;
    }
  } catch (err: any) {
    await Logger.logEvents(
      `Error updating user's password: ${err}`,
      "errLog.log"
    );
    throw new AppError("Database error while updating user's password", 500);
  }
};

const queryUpdateUsersProfile = async (
  userId: string,
  updateProfilePayload: UserProfileUpdatePayload
): Promise<any> => {
  try {
    const updateFields = Object.keys(updateProfilePayload)
      .map((key) => `${key} = ?`)
      .join(", ");

    const values = Object.values(updateProfilePayload);
    values.push(userId); // Add userId for WHERE clause

    const query = `UPDATE users_profile SET ${updateFields} WHERE user_id = ?`;

    const [result] = await pool.execute(query, values);
    return result;
  } catch (err: any) {
    await Logger.logEvents(
      `Error updating user's profile: ${err}`,
      "errLog.log"
    );
    throw new AppError("Database error while updating user's profile", 500);
  }
};

const queryGetUsersProfile = async (userId: string): Promise<any> => {
  const query = "SELECT * FROM users_profile WHERE user_id = ?";
  try {
    const [result] = await pool.execute(query, [userId]);
    return result;
  } catch (err: any) {
    await Logger.logEvents(
      `Error fetching user's profile: ${err}`,
      "errLog.log"
    );
    throw new AppError("Database error while fetching user's profile", 500);
  }
};

export default {
  queryGetUsersInfo,
  queryUpdateUsersName,
  queryUpdateUsersPassword,
  queryUpdateUsersProfile,
  queryGetUsersProfile,
};
