import pool from "../../../config/db.config";
import { AppError } from "../middlewares/error.handlers";
import Logger from "../utils/logger";

const queryIsWeightLogExists = async (
  userId: string,
  date: Date
): Promise<any> => {
  try {
    const query = `SELECT * FROM weight_log WHERE user_id = ? AND log_date = ?`;
    const [result] = await pool.execute(query, [userId, date]);
    return (result as any[]).length > 0;
  } catch (err) {
    Logger.logEvents(
      `Error checking if weight log exists: ${err}`,
      "errLog.log"
    );
    throw new AppError(
      "Database error while checking if weight log exists",
      500
    );
  }
};

const queryGetWeightLogByDate = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<any> => {
  try {
    const query = `SELECT weight_log_id, weight, weight_unit, calories_intake, log_date FROM weight_log WHERE user_id = ? AND log_date BETWEEN ? AND ?`;
    const [result] = await pool.execute(query, [userId, startDate, endDate]);
    return result;
  } catch (err) {
    Logger.logEvents(`Error getting weight log by date: ${err}`, "errLog.log");
    throw new AppError("Database error while getting weight log by date", 500);
  }
};

const queryCreateWeightLog = async (
  weightLogId: string,
  userId: string,
  weight: number,
  weightUnit: string,
  caloriesIntake: number,
  date: Date
): Promise<any> => {
  try {
    const query = `INSERT INTO weight_log (weight_log_id, user_id, weight, weight_unit, calories_intake, log_date) VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.execute(query, [
      weightLogId,
      userId,
      weight,
      weightUnit,
      caloriesIntake,
      date,
    ]);
    return result;
  } catch (error) {
    Logger.logEvents(`Error creating weight log: ${error}`, "errLog.log");
    throw new AppError("Database error while creating weight log", 500);
  }
};

export default {
  queryCreateWeightLog,
  queryIsWeightLogExists,
  queryGetWeightLogByDate,
};
