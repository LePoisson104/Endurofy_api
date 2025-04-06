import { AppError } from "../middlewares/error.handlers";
import { v4 as uuidv4 } from "uuid";
import WeightLogs from "../repositories/weight-log.repositories";
import {
  WeightLogResponse,
  WeightLogPayload,
} from "../interfaces/weight-log.interface";
import pool from "../../../config/db.config";
import Logger from "../utils/logger";
import { format } from "date-fns";

const getWeightLogByDate = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{ data: { weightLogs: WeightLogResponse[] } }> => {
  const weightLogs = await WeightLogs.queryGetWeightLogByDate(
    userId,
    startDate,
    endDate
  );

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
    throw new AppError(
      `You have already logged your weight this date: ${format(
        weightLogPayload.logDate,
        "MM/dd/yyyy"
      )}`,
      400
    );
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

    await connection.execute(
      "UPDATE users SET current_weight = ?, current_weight_unit = ? WHERE user_id = ?",
      [weightLogPayload.weight, weightLogPayload.weightUnit, userId]
    );

    if (
      weightLogPayload.notes === "" ||
      weightLogPayload.notes === null ||
      weightLogPayload.notes === undefined
    ) {
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

export default {
  createWeightLog,
  getWeightLogByDate,
};
