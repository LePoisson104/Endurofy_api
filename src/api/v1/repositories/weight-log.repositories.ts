import pool from "../../../config/db.config";
import { AppError } from "../middlewares/error.handlers";
import Logger from "../utils/logger";

// check to see if the weight log is already exists
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

// this is for update weight log check if the paylaod date match with the log date of the weight log.
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

const queryGetLatestWeightLog = async (userId: string): Promise<any> => {
  try {
    const query = `SELECT * FROM weight_log WHERE user_id = ? ORDER BY log_date DESC LIMIT 1`;
    const [result] = await pool.execute(query, [userId]);
    return result;
  } catch (error) {
    Logger.logEvents(`Error getting latest weight log: ${error}`, "errLog.log");
    throw new AppError("Database error while getting latest weight log", 500);
  }
};

// this getting only the dates for the calendar
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

// this getting the weight log by date and calculate the rate of the weight log
const queryGetWeightLogByDate = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<any> => {
  try {
    const query =
      "SELECT * FROM weight_log WHERE user_id = ? AND log_date >= ? AND log_date < DATE_ADD(?, INTERVAL 1 DAY) ORDER BY log_date DESC";

    const [result] = await pool.execute(query, [userId, startDate, endDate]);
    return result;
  } catch (err) {
    Logger.logEvents(`Error getting weight log by date: ${err}`, "errLog.log");
    throw new AppError("Database error while getting weight log by date", 500);
  }
};

const queryGetAllWeightLog = async (
  userId: string,
  connection?: any
): Promise<any> => {
  try {
    if (connection) {
      const query =
        "SELECT * FROM weight_log WHERE user_id = ? ORDER BY log_date DESC";
      const [result] = await connection.execute(query, [userId]);
      return result;
    } else {
      const query =
        "SELECT * FROM weight_log WHERE user_id = ? ORDER BY log_date DESC";
      const [result] = await pool.execute(query, [userId]);
      return result;
    }
  } catch (err) {
    Logger.logEvents(`Error getting all weight log: ${err}`, "errLog.log");
    throw new AppError("Database error while getting all weight log", 500);
  }
};

// this is to calculate the weekly rate relative to the current week
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
  queryGetWeightLog,
  queryGetWeightLogByDate,
  queryDeleteWeightLog,
  queryGetAllWeightLog,
  queryGetWeightByDate,
  queryGetWeightLogDatesByRange,
  queryGetLatestWeightLog,
};
