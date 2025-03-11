import pool from "../../../config/db.config";
import { User } from "../interfaces/db.models";
import { AppError } from "../middlewares/error.handlers";

const queryGetUsersInfo = async (userId: string): Promise<User[]> => {
  const query =
    "SELECT user_id, email, first_name, last_name, updated_at FROM users WHERE user_id = ?";
  try {
    const [result] = await pool.execute(query, [userId]);
    const users = result as User[];
    if (users.length === 0) {
      throw new AppError("User not found", 404);
    }
    return users;
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error("Error getting user's info", err);
    throw new AppError("Database error while fetching user info", 500);
  }
};

export default { queryGetUsersInfo };
