import pool from "../../../config/db.config";

const AddWater = async (
  food_log_id: string,
  water_log_id: string,
  amount: number,
  unit: string
): Promise<any> => {
  const query = `INSERT INTO water_logs (food_log_id, water_log_id, amount, unit) VALUES (?, ?, ?, ?)`;
  const [rows] = await pool.query(query, [
    food_log_id,
    water_log_id,
    amount,
    unit,
  ]);
  return rows;
};

export default {
  AddWater,
};
