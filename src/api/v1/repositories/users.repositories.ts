import pool from "../../../config/db.config";
import { User, UserProfile } from "../interfaces/db.models";
import { AppError } from "../middlewares/error.handlers";

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
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error("Error getting user's info", err);
    throw new AppError("Database error while fetching user info", 500);
  }
};

const queryDeleteUser = async (userId: string): Promise<any> => {
  const query = "DELETE FROM users WHERE user_id = ?";
  try {
    const [result] = await pool.execute(query, [userId]);
    return result;
  } catch (err) {
    console.error("Error deleting user", err);
    throw new AppError("Database error while deleting user", 500);
  }
};

export default { queryGetUsersInfo, queryDeleteUser };
