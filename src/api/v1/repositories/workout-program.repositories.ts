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

export default {
  queryGetWorkoutProgram,
  queryGetWorkoutProgramDays,
  queryGetProgramDaysExercises,
  queryDeleteWorkoutProgram,
};
