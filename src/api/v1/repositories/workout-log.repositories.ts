import pool from "../../../config/db.config";
import { AppError } from "../middlewares/error.handlers";
import Logger from "../utils/logger";

const queryGetWorkoutLogDates = async (
  userId: string,
  programId: string,
  startDate: string,
  endDate: string
): Promise<any> => {
  try {
    const query =
      "SELECT workout_date, status FROM workout_logs WHERE user_id = ? AND program_id = ? AND workout_date BETWEEN ? AND ? ORDER BY workout_date ASC";

    const [result] = await pool.execute(query, [
      userId,
      programId,
      startDate,
      endDate,
    ]);
    return result as any[];
  } catch (err) {
    Logger.logEvents(`Error getting workout log dates: ${err}`, "errLog.log");
    throw new AppError("Error getting workout log dates", 500);
  }
};

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

const queryUpdateWorkoutSet = async (
  workoutSetId: string,
  workoutExerciseId: string,
  leftReps: number,
  rightReps: number,
  weight: number,
  weightUnit: string
): Promise<any> => {
  try {
    const query =
      "UPDATE workout_sets SET reps_left = ?, reps_right = ?, weight = ?, weight_unit = ? WHERE workout_set_id = ? AND workout_exercise_id = ?";

    const [result] = await pool.execute(query, [
      leftReps,
      rightReps,
      weight,
      weightUnit,
      workoutSetId,
      workoutExerciseId,
    ]);
    return result as any[];
  } catch (err) {
    Logger.logEvents(`Error updating workout set: ${err}`, "errLog.log");
    throw new AppError("Database error while updating workout set", 500);
  }
};

const queryUpdateWorkoutLogStatus = async (
  workoutLogId: string,
  status: string
): Promise<any> => {
  try {
    const query = "UPDATE workout_logs SET status = ? WHERE workout_log_id = ?";

    const [result] = await pool.execute(query, [status, workoutLogId]);
    return result as any[];
  } catch (err) {
    Logger.logEvents(`Error setting workout log status: ${err}`, "errLog.log");
    throw new AppError("Database error while setting workout log status", 500);
  }
};

const queryPreviousWorkoutLogForExercise = async (
  userId: string,
  programId: string,
  dayId: string,
  programExerciseId: string,
  setNumber: number,
  currentWorkoutDate: string,
  connection?: any
): Promise<any> => {
  try {
    const query = `
      SELECT 
        ws.reps_left as leftReps,
        ws.reps_right as rightReps,
        ws.weight,
        ws.weight_unit as weightUnit
      FROM workout_logs wl
      JOIN workout_exercises we ON wl.workout_log_id = we.workout_log_id
      JOIN workout_sets ws ON we.workout_exercise_id = ws.workout_exercise_id
      WHERE wl.user_id = ? 
        AND wl.program_id = ? 
        AND wl.day_id = ? 
        AND we.program_exercise_id = ?
        AND ws.set_number = ?
        AND wl.workout_date < ?
      ORDER BY wl.workout_date DESC
      LIMIT 1
    `;

    if (connection) {
      const [result] = await connection.execute(query, [
        userId,
        programId,
        dayId,
        programExerciseId,
        setNumber,
        currentWorkoutDate,
      ]);
      return result as any[];
    } else {
      const [result] = await pool.execute(query, [
        userId,
        programId,
        dayId,
        programExerciseId,
        setNumber,
        currentWorkoutDate,
      ]);
      return result as any[];
    }
  } catch (err) {
    Logger.logEvents(
      `Error querying previous workout log for exercise: ${err}`,
      "errLog.log"
    );
    throw new AppError(
      "Database error while querying previous workout log for exercise",
      500
    );
  }
};

export default {
  queryIsWorkoutLogExists,
  queryIsWorkoutExerciseExists,
  queryWorkoutLogsByDateRange,
  queryUpdateExerciseNotes,
  queryGetWorkoutLogDates,
  queryUpdateWorkoutSet,
  queryUpdateWorkoutLogStatus,
  queryPreviousWorkoutLogForExercise,
};
