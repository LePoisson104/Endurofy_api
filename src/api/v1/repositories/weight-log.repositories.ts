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

const queryGetWeightLog = async (
  userId: string,
  weightLogId: string
): Promise<any> => {
  try {
    const query = `SELECT * FROM weight_log WHERE user_id = ? AND weight_log_id = ?`;
    const [result] = await pool.execute(query, [userId, weightLogId]);
    return result;
  } catch (error) {
    Logger.logEvents(`Error getting weight log: ${error}`, "errLog.log");
    throw new AppError("Database error while getting weight log", 500);
  }
};

const queryGetWeightLogDatesByRange = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<any> => {
  const query = `SELECT log_date FROM weight_log WHERE user_id = ? AND log_date BETWEEN ? AND ? ORDER BY log_date DESC;`;
  try {
    const [result] = await pool.execute(query, [userId, startDate, endDate]);
    return result;
  } catch (err) {
    Logger.logEvents(
      `Error getting weight log dates by range: ${err}`,
      "errLog.log"
    );
    throw new AppError(
      "Database error while getting weight log dates by range",
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
    const query = `
  SELECT 
    wl.weight_log_id,
    wl.weight,
    wl.weight_unit,
    wl.calories_intake,
    wl.log_date,
    wln.notes
  FROM weight_log wl
  LEFT JOIN weight_log_notes wln ON wl.weight_log_id = wln.weight_log_id
  WHERE wl.user_id = ? AND wl.log_date >= ? AND wl.log_date < DATE_ADD(?, INTERVAL 1 DAY)
  ORDER BY wl.log_date DESC
`;

    const [result] = await pool.execute(query, [userId, startDate, endDate]);
    return result;
  } catch (err) {
    Logger.logEvents(`Error getting weight log by date: ${err}`, "errLog.log");
    throw new AppError("Database error while getting weight log by date", 500);
  }
};

const queryGetAllWeightLog = async (userId: string): Promise<any> => {
  try {
    const query = `
      SELECT 
        wl.weight_log_id,
        wl.weight,
        wl.weight_unit,
        wl.calories_intake,
        wl.log_date,
        wln.notes
      FROM weight_log wl
      LEFT JOIN weight_log_notes wln ON wl.weight_log_id = wln.weight_log_id
      WHERE wl.user_id = ?
      ORDER BY wl.log_date DESC
    `;
    const [result] = await pool.execute(query, [userId]);
    return result;
  } catch (err) {
    Logger.logEvents(`Error getting all weight log: ${err}`, "errLog.log");
    throw new AppError("Database error while getting all weight log", 500);
  }
};

const queryGetWeightByDate = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<any> => {
  try {
    const query = `
      SELECT weight, weight_unit, log_date FROM weight_log WHERE user_id = ? AND log_date BETWEEN ? AND ?
    `;
    const [result] = await pool.execute(query, [userId, startDate, endDate]);
    return result;
  } catch (err) {
    Logger.logEvents(`Error getting weight by date: ${err}`, "errLog.log");
    throw new AppError("Database error while getting weight by date", 500);
  }
};

const queryDeleteWeightLog = async (
  weightLogId: string,
  userId: string
): Promise<any> => {
  try {
    const query = `DELETE FROM weight_log WHERE weight_log_id = ? AND user_id = ?`;
    const [result] = await pool.execute(query, [weightLogId, userId]);
    return result;
  } catch (err) {
    Logger.logEvents(`Error deleting weight log: ${err}`, "errLog.log");
    throw new AppError("Database error while deleting weight log", 500);
  }
};

export default {
  queryIsWeightLogExists,
  queryGetWeightLogByDate,
  queryDeleteWeightLog,
  queryGetWeightLog,
  queryGetAllWeightLog,
  queryGetWeightByDate,
  queryGetWeightLogDatesByRange,
};
