import pool from "../../../config/db.config";
import { User, UserProfile } from "../interfaces/db.models";
import { AppError } from "../middlewares/error.handlers";
import { UserProfileUpdatePayload } from "../interfaces/user.interfaces";
import Logger from "../utils/logger";

const GetUsersInfo = async (
  userId: string
): Promise<{ user: User; userProfile: UserProfile }> => {
  const userQuery =
    "SELECT email, first_name, last_name, updated_at, pending_email FROM users WHERE user_id = ?";
  const userProfileQuery =
    "SELECT profile_status, birth_date, starting_weight, starting_weight_unit, current_weight, current_weight_unit, weight_goal, weight_goal_unit, height, height_unit, gender, goal, activity_level, updated_at FROM users_profile WHERE user_id = ?";

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
};

const GetUsersMacrosGoals = async (userId: string): Promise<any> => {
  const query = "SELECT * FROM macros_goals WHERE user_id = ?";
  const [result] = await pool.execute(query, [userId]);
  return result;
};

const UpdateUsersName = async (
  userId: string,
  firstName: string,
  lastName: string,
  updatedAt: Date
): Promise<any> => {
  const query =
    "UPDATE users SET first_name = ?, last_name = ?, updated_at = ? WHERE user_id = ?";
  const [result] = await pool.execute(query, [
    firstName,
    lastName,
    updatedAt,
    userId,
  ]);
  return result;
};

const UpdateUsersPassword = async (
  userId: string,
  hashedPassword: string,
  updateAt: Date,
  connection?: any
): Promise<any> => {
  const query =
    "UPDATE users SET hashed_password = ?, updated_at = ? WHERE user_id = ?";
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
};

const UpdateUsersProfileAndCaloriesGoal = async (
  userId: string,
  updateProfilePayload: UserProfileUpdatePayload,
  calories: number
): Promise<any> => {
  const connection = await pool.getConnection();

  const updateFields = Object.keys(updateProfilePayload)
    .map((key) => `${key} = ?`)
    .join(", ");

  const values = Object.values(updateProfilePayload);
  values.push(userId); // Add userId for WHERE clause

  try {
    await connection.beginTransaction();

    const query = `UPDATE users_profile SET ${updateFields} WHERE user_id = ?`;

    await connection.execute(query, values);

    await connection.execute(
      "UPDATE macros_goals SET calories = ? WHERE user_id = ?",
      [calories, userId]
    );

    await connection.commit();

    return;
  } catch (err) {
    await connection.rollback();
    await Logger.logEvents(
      `Error updating user's profile: ${err}`,
      "errLog.log"
    );
    throw new AppError("Error updating user's profile", 500);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const GetUsersProfile = async (userId: string): Promise<any> => {
  const query = "SELECT * FROM users_profile WHERE user_id = ?";
  const [result] = await pool.execute(query, [userId]);
  return result;
};

const UpdateMacrosGoals = async (
  userId: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  updatedAt: Date
): Promise<any> => {
  const query =
    "UPDATE macros_goals SET calories = ?, protein = ?, carbs = ?, fat = ?, updated_at = ? WHERE user_id = ?";
  const [result] = await pool.execute(query, [
    calories,
    protein,
    carbs,
    fat,
    updatedAt,
    userId,
  ]);
  return result;
};

export default {
  GetUsersInfo,
  GetUsersMacrosGoals,
  UpdateUsersName,
  UpdateUsersPassword,
  UpdateUsersProfileAndCaloriesGoal,
  GetUsersProfile,
  UpdateMacrosGoals,
};
