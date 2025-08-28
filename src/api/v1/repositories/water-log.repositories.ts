import pool from "../../../config/db.config";

const GetWaterLogByDate = async (userId: string, date: string) => {
  const query = `
    SELECT 
      wl.water_log_id,
      wl.amount,
      wl.unit,
      fl.food_log_id,
      fl.user_id,
      fl.log_date,
      fl.status
    FROM food_logs fl
    JOIN water_logs wl 
        ON fl.food_log_id = wl.food_log_id
    WHERE fl.user_id = ? 
    AND fl.log_date = ?;
  `;
  const [waterLog] = await pool.execute(query, [userId, date]);
  return waterLog;
};

export default {
  GetWaterLogByDate,
};
