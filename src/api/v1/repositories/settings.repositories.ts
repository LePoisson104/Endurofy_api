import pool from "../../../config/db.config";
import Logger from "../utils/logger";
import { AppError } from "../middlewares/error.handlers";

const queryGetSettings = async (userId: string): Promise<any> => {
  try {
    const query = "SELECT * FROM settings WHERE user_id = ?";
    const [result] = await pool.execute(query, [userId]);
    return result;
  } catch (err: any) {
    await Logger.logEvents(`Error getting settings: ${err}`, "errLog.log");
    throw new AppError("Database error while getting settings", 500);
  }
};

const queryToggleTheme = async (
  userId: string,
  theme: string,
  updatedAt: Date
): Promise<any> => {
  try {
    const query =
      "UPDATE settings SET theme = ?, updated_at = ? WHERE user_id = ?";
    const [result] = await pool.execute(query, [theme, updatedAt, userId]);
    return result;
  } catch (err: any) {
    await Logger.logEvents(`Error toggling theme: ${err}`, "errLog.log");
    throw new AppError("Database error while toggling theme", 500);
  }
};

export default {
  queryGetSettings,
  queryToggleTheme,
};
