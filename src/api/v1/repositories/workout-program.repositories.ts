import pool from "../../../config/db.config";
import { AppError } from "../middlewares/error.handlers";
import Logger from "../utils/logger";

const queryGetWorkoutProgram = async (userId: string): Promise<any> => {
  try {
    const query = "SELECT * FROM programs WHERE user_id = ?";
    const [result] = await pool.execute(query, [userId]);
    return result;
  } catch (err) {
    Logger.logEvents(`Error getting workout program: ${err}`, "errLog.log");
    throw new AppError("Database error while getting workout program", 500);
  }
};

const queryGetWorkoutProgramDays = async (programId: string): Promise<any> => {
  try {
    const query = "SELECT * FROM program_days WHERE program_id = ?";
    const [result] = await pool.execute(query, [programId]);
    return result;
  } catch (err) {
    Logger.logEvents(
      `Error getting workout program days: ${err}`,
      "errLog.log"
    );
    throw new AppError(
      "Database error while getting workout program days",
      500
    );
  }
};

const queryGetProgramDaysExercises = async (
  programDayId: string
): Promise<any> => {
  try {
    const query = "SELECT * FROM program_exercises WHERE program_day_id = ?";
    const [result] = await pool.execute(query, [programDayId]);
    return result;
  } catch (err) {
    Logger.logEvents(
      `Error getting workout program days exercises: ${err}`,
      "errLog.log"
    );
    throw new AppError(
      "Database error while getting workout program days exercises",
      500
    );
  }
};

const queryUpdateWorkoutProgramDescription = async (
  userId: string,
  programId: string,
  programName: string,
  description: string
): Promise<any> => {
  try {
    const query =
      "UPDATE programs SET program_name = ?, description = ? WHERE user_id = ? AND program_id = ?";
    const [result] = await pool.execute(query, [
      programName,
      description,
      userId,
      programId,
    ]);
    return result;
  } catch (err) {
    Logger.logEvents(
      `Error updating workout program description: ${err}`,
      "errLog.log"
    );
    throw new AppError(
      "Database error while updating workout program description",
      500
    );
  }
};

const queryUpdateWorkoutProgramDay = async (
  programId: string,
  dayId: string,
  dayName: string
): Promise<any> => {
  try {
    const query =
      "UPDATE program_days SET day_name = ? WHERE program_id = ? AND program_day_id = ?";
    const [result] = await pool.execute(query, [dayName, programId, dayId]);
    return result;
  } catch (err) {
    Logger.logEvents(
      `Error updating workout program day: ${err}`,
      "errLog.log"
    );
    throw new AppError(
      "Database error while updating workout program day",
      500
    );
  }
};

const queryUpdateWorkoutProgramExercise = async (
  dayId: string,
  exerciseId: string,
  exerciseName: string,
  bodyPart: string,
  laterality: string,
  sets: number,
  minReps: number,
  maxReps: number,
  exerciseOrder: number
): Promise<any> => {
  try {
    const query =
      "UPDATE program_exercises SET exercise_name = ?, body_part = ?, laterality = ?, sets = ?, min_reps = ?, max_reps = ?, exercise_order = ? WHERE program_day_id = ? AND program_exercise_id = ?";
    const [result] = await pool.execute(query, [
      exerciseName,
      bodyPart,
      laterality,
      sets,
      minReps,
      maxReps,
      exerciseOrder,
      dayId,
      exerciseId,
    ]);
    return result;
  } catch (err) {
    Logger.logEvents(
      `Error updating workout program exercise: ${err}`,
      "errLog.log"
    );
    throw new AppError(
      "Database error while updating workout program exercise",
      500
    );
  }
};

const queryDeleteWorkoutProgram = async (
  userId: string,
  programId: string
): Promise<any> => {
  try {
    const query = "DELETE FROM programs WHERE user_id = ? AND program_id = ?";
    const [result] = await pool.execute(query, [userId, programId]);
    return result;
  } catch (err) {
    Logger.logEvents(`Error deleting workout program: ${err}`, "errLog.log");
    throw new AppError("Database error while deleting workout program", 500);
  }
};

const queryDeleteWorkoutProgramDay = async (
  programId: string,
  dayId: string
): Promise<any> => {
  try {
    const query =
      "DELETE FROM program_days WHERE program_id = ? AND program_day_id = ?";
    const [result] = await pool.execute(query, [programId, dayId]);
    return result;
  } catch (err) {
    Logger.logEvents(
      `Error deleting workout program day: ${err}`,
      "errLog.log"
    );
    throw new AppError(
      "Database error while deleting workout program day",
      500
    );
  }
};

const queryDeleteWorkoutProgramExercise = async (
  dayId: string,
  exerciseId: string
): Promise<any> => {
  try {
    const query =
      "DELETE FROM program_exercises WHERE program_day_id = ? AND program_exercise_id = ?";
    const [result] = await pool.execute(query, [dayId, exerciseId]);
    return result;
  } catch (err) {
    Logger.logEvents(
      `Error deleting workout program exercise: ${err}`,
      "errLog.log"
    );
    throw new AppError(
      "Database error while deleting workout program exercise",
      500
    );
  }
};

const queryUpdateWorkoutProgramUpdatedAt = async (
  programId: string
): Promise<any> => {
  try {
    const query = "UPDATE programs SET updated_at = NOW() WHERE program_id = ?";
    const [result] = await pool.execute(query, [programId]);
    return result;
  } catch (err) {
    Logger.logEvents(
      `Error updating workout program updated at: ${err}`,
      "errLog.log"
    );
    throw new AppError(
      "Database error while updating workout program updated at",
      500
    );
  }
};

export default {
  queryGetWorkoutProgram,
  queryGetWorkoutProgramDays,
  queryGetProgramDaysExercises,
  queryDeleteWorkoutProgram,
  queryDeleteWorkoutProgramDay,
  queryDeleteWorkoutProgramExercise,
  queryUpdateWorkoutProgramDescription,
  queryUpdateWorkoutProgramDay,
  queryUpdateWorkoutProgramExercise,
  queryUpdateWorkoutProgramUpdatedAt,
};
