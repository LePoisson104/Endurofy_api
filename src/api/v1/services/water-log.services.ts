import { v4 as uuidv4 } from "uuid";
import { AppError } from "../middlewares/error.handlers";
import pool from "../../../config/db.config";
import Logger from "../utils/logger";
import waterLogRepository from "../repositories/water-log.repositories";
import type { AddWaterLogPayload } from "../interfaces/water-log.interfaces";

const GetWaterLogByDate = async (userId: string, date: string) => {
  const waterLog = await waterLogRepository.GetWaterLogByDate(userId, date);

  return waterLog;
};

// this service assume that food log does not exists
const addWaterLog = async (
  userId: string,
  date: string,
  waterPayload: AddWaterLogPayload
): Promise<{ message: string }> => {
  const { amount, unit } = waterPayload;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [isFoodLogExists]: any = await connection.execute(
      "SELECT food_log_id FROM food_logs WHERE user_id = ? AND log_date = ?",
      [userId, date]
    );

    if (isFoodLogExists.length === 1) {
      const [isWaterLogExists]: any = await connection.execute(
        "SELECT water_log_id from water_logs WHERE food_log_id = ?",
        [isFoodLogExists[0].food_log_id]
      );

      if (isWaterLogExists.length === 1)
        throw new AppError(
          `Water log already exists for the date ${date}`,
          500
        );
    }

    const waterLogId = uuidv4();
    const foodLogId =
      isFoodLogExists.length === 0 ? uuidv4() : isFoodLogExists[0].food_log_id;

    if (isFoodLogExists.length === 0) {
      await connection.execute(
        "INSERT INTO food_logs (food_log_id, user_id, status, log_date) VALUES (?, ?, ?, ?)",
        [foodLogId, userId, "incomplete", date.split("T")[0]]
      );
    }

    await connection.execute(
      "INSERT INTO water_logs (water_log_id, food_log_id, amount, unit) VALUES (?,?,?,?)",
      [waterLogId, foodLogId, amount, unit]
    );

    await connection.commit();

    return {
      message: "Water added successfully",
    };
  } catch (err) {
    await connection.rollback();
    await Logger.logEvents(
      `Error creating new water log: ${err}`,
      "errLog.log"
    );
    if (err instanceof AppError) throw err;
    throw new AppError("Error creating new water log", 500);
  } finally {
    if (connection) connection.release();
  }
};

const updateWaterLog = async (
  waterLogId: string,
  foodLogId: string,
  amount: number
): Promise<{ message: string }> => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    if (amount <= 0) {
      const result = await deleteWaterLog(waterLogId, foodLogId, connection);
      await connection.commit();
      return result;
    }

    const [updatedWaterLog]: any = await connection.execute(
      "UPDATE water_logs SET amount = ? WHERE water_log_id = ?",
      [amount, waterLogId]
    );

    if (updatedWaterLog.affectedRows === 0)
      throw new AppError("Water log not found", 500);

    await connection.commit();
    return { message: "Water updated successfully" };
  } catch (err) {
    await connection.rollback();
    await Logger.logEvents(`Error updating water log ${err} `, "errLog.log");
    if (err instanceof AppError) throw err;
    throw new AppError("Error updating water log", 500);
  } finally {
    if (connection) connection.release();
  }
};

const deleteWaterLog = async (
  waterLogId: string,
  foodLogId: string,
  connection?: any
): Promise<{ message: string }> => {
  const localConnection = connection || (await pool.getConnection());
  let externalConnection = !!connection; // check if we got connection from caller

  try {
    if (!externalConnection) await localConnection.beginTransaction();

    const [deletedWaterLog]: any = await localConnection.execute(
      "DELETE FROM water_logs WHERE water_log_id = ?",
      [waterLogId]
    );

    if (deletedWaterLog.affectedRows === 0)
      throw new AppError("Water log not found", 500);

    const [foodLog]: any = await localConnection.execute(
      "SELECT COUNT(*) as count FROM logged_foods WHERE food_log_id = ?",
      [foodLogId]
    );

    if (foodLog[0].count === 0) {
      await localConnection.execute(
        "DELETE FROM food_logs WHERE food_log_id = ?",
        [foodLogId]
      );
    }

    if (!externalConnection) await localConnection.commit();

    return { message: "Water log deleted successfully" };
  } catch (err) {
    if (!externalConnection) await localConnection.rollback();
    await Logger.logEvents(`Error deleting water log ${err}`, "errLog.log");
    throw new AppError("Error deleting water log", 500);
  } finally {
    if (!externalConnection && localConnection) localConnection.release();
  }
};

export default {
  GetWaterLogByDate,
  addWaterLog,
  updateWaterLog,
  deleteWaterLog,
};
