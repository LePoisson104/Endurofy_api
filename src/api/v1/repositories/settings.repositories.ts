import pool from "../../../config/db.config";

const GetSettings = async (userId: string): Promise<any> => {
  const query = "SELECT * FROM settings WHERE user_id = ?";
  const [result] = await pool.execute(query, [userId]);
  return result;
};

const ToggleTheme = async (
  userId: string,
  theme: string,
  updatedAt: Date
): Promise<any> => {
  const query =
    "UPDATE settings SET theme = ?, updated_at = ? WHERE user_id = ?";
  const [result] = await pool.execute(query, [theme, updatedAt, userId]);
  return result;
};

export default {
  GetSettings,
  ToggleTheme,
};
