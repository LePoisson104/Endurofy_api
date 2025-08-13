import pool from "../../../config/db.config";

// check to see if the weight log is already exists
const IsWeightLogExists = async (
  userId: string,
  date: Date,
  connection?: any
): Promise<any> => {
  if (connection) {
    const query = `SELECT * FROM weight_log WHERE user_id = ? AND log_date = ?`;
    const [result] = await connection.execute(query, [userId, date]);
    return (result as any[]).length > 0;
  } else {
    const query = `SELECT * FROM weight_log WHERE user_id = ? AND log_date = ?`;
    const [result] = await pool.execute(query, [userId, date]);
    return (result as any[]).length > 0;
  }
};

// this is for update weight log check if the paylaod date match with the log date of the weight log.
const GetWeightLog = async (
  userId: string,
  weightLogId: string,
  connection?: any
): Promise<any> => {
  if (connection) {
    const query = `SELECT * FROM weight_log WHERE user_id = ? AND weight_log_id = ?`;
    const [result] = await connection.execute(query, [userId, weightLogId]);
    return result;
  } else {
    const query = `SELECT * FROM weight_log WHERE user_id = ? AND weight_log_id = ?`;
    const [result] = await pool.execute(query, [userId, weightLogId]);
    return result;
  }
};

const GetLatestWeightLog = async (
  userId: string,
  connection?: any
): Promise<any> => {
  if (connection) {
    const query = `SELECT * FROM weight_log WHERE user_id = ? ORDER BY log_date DESC LIMIT 1`;
    const [result] = await connection.execute(query, [userId]);
    return result;
  } else {
    const query = `SELECT * FROM weight_log WHERE user_id = ? ORDER BY log_date DESC LIMIT 1`;
    const [result] = await pool.execute(query, [userId]);
    return result;
  }
};

// this getting only the dates for the calendar
const GetWeightLogDatesByRange = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<any> => {
  const query = `SELECT log_date FROM weight_log WHERE user_id = ? AND log_date BETWEEN ? AND ? ORDER BY log_date DESC;`;

  const [result] = await pool.execute(query, [userId, startDate, endDate]);
  return result;
};

// this getting the weight log by date and calculate the rate of the weight log
const GetWeightLogByDate = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<any> => {
  const query =
    "SELECT * FROM weight_log WHERE user_id = ? AND log_date >= ? AND log_date < DATE_ADD(?, INTERVAL 1 DAY) ORDER BY log_date DESC";

  const [result] = await pool.execute(query, [userId, startDate, endDate]);
  return result;
};

const GetAllWeightLog = async (
  userId: string,
  connection?: any
): Promise<any> => {
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
};

// this is to calculate the weekly rate relative to the current week
const GetWeightByDate = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<any> => {
  const query = `
      SELECT weight, weight_unit, log_date FROM weight_log WHERE user_id = ? AND log_date BETWEEN ? AND ?
    `;
  const [result] = await pool.execute(query, [userId, startDate, endDate]);
  return result;
};

const DeleteWeightLog = async (
  weightLogId: string,
  userId: string
): Promise<any> => {
  const query = `DELETE FROM weight_log WHERE weight_log_id = ? AND user_id = ?`;
  const [result] = await pool.execute(query, [weightLogId, userId]);
  return result;
};

export default {
  IsWeightLogExists,
  GetWeightLog,
  GetWeightLogByDate,
  DeleteWeightLog,
  GetAllWeightLog,
  GetWeightByDate,
  GetWeightLogDatesByRange,
  GetLatestWeightLog,
};
