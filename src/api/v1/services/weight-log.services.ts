import { AppError } from "../middlewares/error.handlers";
import { v4 as uuidv4 } from "uuid";
import WeightLogs from "../repositories/weight-log.repositories";
import {
  WeightLogResponse,
  WeightLogPayload,
} from "../interfaces/weight-log.interface";
import pool from "../../../config/db.config";
import Logger from "../utils/logger";

const getWeightLogByRange = async (
  userId: string,
  startDate?: Date,
  endDate?: Date,
  options?: "all" | "date"
): Promise<{ data: { weightLogs: WeightLogResponse[] } }> => {
  let weightLogs;

  if (options === "all") {
    weightLogs = await WeightLogs.queryGetAllWeightLog(userId);
  } else if (options === "date" && startDate && endDate) {
    weightLogs = await WeightLogs.queryGetWeightLogByDate(
      userId,
      startDate,
      endDate
    );
  } else {
    throw new AppError("Invalid range type", 400);
  }

  if (weightLogs.length === 0) {
    return { data: { weightLogs: [] } };
  }

  const sortedLogs = weightLogs.sort(
    (a: any, b: any) =>
      new Date(a.log_date).getTime() - new Date(b.log_date).getTime()
  );

  const weightLogsWithRateChange = [];
  for (let i = weightLogs.length - 1; i >= 0; i--) {
    if (i === 0) {
      weightLogsWithRateChange.push({
        ...sortedLogs[i],
        rateChange: 0,
      });
    } else {
      const prevLog = sortedLogs[i - 1];
      const currLog = sortedLogs[i];
      const weightChange = Number(currLog.weight) - Number(prevLog.weight);
      const daysDiff =
        (new Date(currLog.log_date).getTime() -
          new Date(prevLog.log_date).getTime()) /
        (1000 * 60 * 60 * 24); // Convert ms to days
      const rateChange = Math.round((weightChange / daysDiff) * 100) / 100; // Rate of weight change per day
      weightLogsWithRateChange.push({
        ...currLog,
        rateChange,
      });
    }
  }

  return { data: { weightLogs: weightLogsWithRateChange } };
};

const createWeightLog = async (
  userId: string,
  weightLogPayload: WeightLogPayload
): Promise<{ data: { message: string } }> => {
  const connection = await pool.getConnection();

  if (weightLogPayload.notes.length > 50) {
    throw new AppError("Notes cannot be more than 50 characters", 400);
  }

  const isWeightLogExists = await WeightLogs.queryIsWeightLogExists(
    userId,
    weightLogPayload.logDate
  );

  if (isWeightLogExists) {
    throw new AppError("Weight log already exists for this date", 400);
  }

  try {
    await connection.beginTransaction();
    const weightLogId = uuidv4();

    await connection.execute(
      "INSERT INTO weight_log (weight_log_id, user_id, weight, weight_unit, calories_intake, log_date) VALUES (?, ?, ?, ?, ?, ?)",
      [
        weightLogId,
        userId,
        weightLogPayload.weight,
        weightLogPayload.weightUnit,
        weightLogPayload.caloriesIntake,
        weightLogPayload.logDate,
      ]
    );

    // Update current weight if the log date is today
    console.log(
      new Date().toString() === new Date(weightLogPayload.logDate).toString()
    );
    console.log(new Date().toString());
    console.log("2025-04-09".toString());

    if (
      new Date(weightLogPayload.logDate).toString() === new Date().toString()
    ) {
      await connection.execute(
        "UPDATE users_profile SET current_weight = ?, current_weight_unit = ? WHERE user_id = ?",
        [weightLogPayload.weight, weightLogPayload.weightUnit, userId]
      );
    }

    if (
      weightLogPayload.notes === "" ||
      weightLogPayload.notes === null ||
      weightLogPayload.notes === undefined
    ) {
      await connection.commit();
      return {
        data: {
          message: "Weight log created successfully",
        },
      };
    }

    const noteId = uuidv4();

    await connection.execute(
      "INSERT INTO weight_log_notes (note_id, weight_log_id, notes) VALUES (?, ?, ?)",
      [noteId, weightLogId, weightLogPayload.notes]
    );

    await connection.commit();

    return {
      data: {
        message: "Weight log created successfully",
      },
    };
  } catch (err) {
    await connection.rollback();
    await Logger.logEvents(`Error creating weight log: ${err}`, "errLog.log");
    throw new AppError("Database error while creating weight log", 500);
  } finally {
    connection.release();
  }
};

const updateWeightLog = async (
  weightLogId: string,
  userId: string,
  weightLogPayload: WeightLogPayload
): Promise<{ data: { message: string } }> => {
  const connection = await pool.getConnection();

  if (weightLogPayload.notes.length > 50) {
    throw new AppError("Notes cannot be more than 50 characters", 400);
  }

  const weightLog = await WeightLogs.queryGetWeightLog(userId, weightLogId);

  if (!weightLog) {
    throw new AppError("Weight log not found", 404);
  }

  // if the weight log date is not the same as the payload date, check if the date already exists
  if (
    weightLog &&
    new Date(weightLogPayload.logDate).toISOString().split("T")[0] !==
      weightLog[0].log_date.toISOString().split("T")[0]
  ) {
    const isWeightLogExists = await WeightLogs.queryIsWeightLogExists(
      userId,
      weightLogPayload.logDate
    );

    if (isWeightLogExists) {
      throw new AppError("Weight log already exists for this date", 400);
    }
  }

  try {
    await connection.beginTransaction();

    await connection.execute(
      "UPDATE weight_log SET weight = ?, weight_unit = ?, calories_intake = ?, log_date = ? WHERE weight_log_id = ?",
      [
        weightLogPayload.weight,
        weightLogPayload.weightUnit,
        weightLogPayload.caloriesIntake,
        weightLogPayload.logDate,
        weightLogId,
      ]
    );

    // update current weight if the log date is today
    if (
      new Date(weightLogPayload.logDate).toISOString().split("T")[0] ===
      new Date().toISOString().split("T")[0]
    ) {
      await connection.execute(
        "UPDATE users_profile SET current_weight = ?, current_weight_unit = ? WHERE user_id = ?",
        [weightLogPayload.weight, weightLogPayload.weightUnit, userId]
      );
    }

    const [result] = await connection.execute(
      "SELECT * FROM weight_log_notes WHERE weight_log_id = ?",
      [weightLogId]
    );

    const isWeightLogNoteExists = (result as any[]).length > 0;

    // if note exists and new notes is empty, delete the note
    if (
      isWeightLogNoteExists &&
      (weightLogPayload.notes === "" ||
        weightLogPayload.notes === null ||
        weightLogPayload.notes === undefined)
    ) {
      await connection.execute(
        "DELETE FROM weight_log_notes WHERE weight_log_id = ?",
        [weightLogId]
      );
      await connection.commit();
      return {
        data: {
          message: "Weight log updated successfully",
        },
      };
    }

    // if note does not exist and new notes is not empty, create a new note
    if (!isWeightLogNoteExists && weightLogPayload.notes) {
      const noteId = uuidv4();
      await connection.execute(
        "INSERT INTO weight_log_notes (note_id, weight_log_id, notes) VALUES (?, ?, ?)",
        [noteId, weightLogId, weightLogPayload.notes]
      );
      await connection.commit();
      return {
        data: {
          message: "Weight log updated successfully",
        },
      };
    }

    // if note exists and new notes is not empty, update the note
    if (isWeightLogNoteExists && weightLogPayload.notes) {
      await connection.execute(
        "UPDATE weight_log_notes SET notes = ? WHERE weight_log_id = ?",
        [weightLogPayload.notes, weightLogId]
      );
    }

    await connection.commit();

    return {
      data: {
        message: "Weight log updated successfully",
      },
    };
  } catch (err) {
    await connection.rollback();
    await Logger.logEvents(`Error updating weight log: ${err}`, "errLog.log");
    throw new AppError("Database error while updating weight log", 500);
  } finally {
    connection.release();
  }
};

const deleteWeightLog = async (
  weightLogId: string,
  userId: string
): Promise<{ data: { message: string } }> => {
  const result = await WeightLogs.queryDeleteWeightLog(weightLogId, userId);
  if (result.affectedRows === 0) {
    throw new AppError("Weight log not found", 404);
  }

  return {
    data: {
      message: "Weight log deleted successfully",
    },
  };
};

export default {
  createWeightLog,
  getWeightLogByRange,
  deleteWeightLog,
  updateWeightLog,
};
