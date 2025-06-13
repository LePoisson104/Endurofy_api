import pool from "../../../config/db.config";
import { AppError } from "../middlewares/error.handlers";
import Logger from "../utils/logger";

const queryIsWorkoutLogExists = async (
  userId: string,
  programId: string,
  workoutDate: string,
  connection?: any
): Promise<any> => {
  try {
    const query =
      "SELECT * FROM workout_logs WHERE user_id = ? AND program_id = ? AND workout_date = ?";

    if (connection) {
      const [result] = await connection.execute(query, [
        userId,
        programId,
        workoutDate,
      ]);
      return result as any[];
    } else {
      const [result] = await pool.execute(query, [
        userId,
        programId,
        workoutDate,
      ]);
      return result as any[];
    }
  } catch (err) {
    Logger.logEvents(
      `Error checking if workout log exists: ${err}`,
      "errLog.log"
    );
    throw new AppError(
      "Database error while checking if workout log exists",
      500
    );
  }
};

const queryWorkoutLogsByDateRange = async (
  userId: string,
  programId: string,
  startDate: string,
  endDate: string,
  connection?: any
): Promise<any> => {
  try {
    const query =
      "SELECT * FROM workout_logs WHERE user_id = ? AND program_id = ? AND workout_date BETWEEN ? AND ? ORDER BY workout_date";

    if (connection) {
      const [result] = await connection.execute(query, [
        userId,
        programId,
        startDate,
        endDate,
      ]);
      return result as any[];
    } else {
      const [result] = await pool.execute(query, [
        userId,
        programId,
        startDate,
        endDate,
      ]);
      return result as any[];
    }
  } catch (err) {
    Logger.logEvents(
      `Error querying workout logs by date range: ${err}`,
      "errLog.log"
    );
    throw new AppError(
      "Database error while querying workout logs by date range",
      500
    );
  }
};

const queryUpdateExerciseNotes = async (
  workoutExerciseId: string,
  exerciseNotes: string
): Promise<any> => {
  try {
    const query =
      "UPDATE workout_exercises SET notes = ? WHERE workout_exercise_id = ?";

    const [result] = await pool.execute(query, [
      exerciseNotes,
      workoutExerciseId,
    ]);
    return result as any[];
  } catch (err) {
    Logger.logEvents(`Error updating exercise notes: ${err}`, "errLog.log");
    throw new AppError("Database error while updating exercise notes", 500);
  }
};

const queryIsWorkoutExerciseExists = async (
  workoutLogId: string,
  programExerciseId: string,
  connection?: any
): Promise<any> => {
  try {
    const query =
      "SELECT * FROM workout_exercises WHERE workout_log_id = ? AND program_exercise_id = ?";

    if (connection) {
      const [result] = await connection.execute(query, [
        workoutLogId,
        programExerciseId,
      ]);
      return result as any[];
    } else {
      const [result] = await pool.execute(query, [
        workoutLogId,
        programExerciseId,
      ]);
      return result as any[];
    }
  } catch (err) {
    Logger.logEvents(
      `Error checking if workout exercise exists: ${err}`,
      "errLog.log"
    );
    throw new AppError(
      "Database error while checking if workout exercise exists",
      500
    );
  }
};

export default {
  queryIsWorkoutLogExists,
  queryIsWorkoutExerciseExists,
  queryWorkoutLogsByDateRange,
  queryUpdateExerciseNotes,
};
