import pool from "../../../config/db.config";
import { AppError } from "../middlewares/error.handlers";
import Logger from "../utils/logger";

const queryIsWorkoutLogExists = async (
  userId: string,
  programId: string,
  workoutDate: Date,
  connection?: any
): Promise<any> => {
  try {
    const query =
      "SELECT * FROM workout_logs WHERE user_id = ? AND program_id = ? AND workout_date = ?";

    if (connection) {
      console.log("use connection");
      const [result] = await connection.execute(query, [
        userId,
        programId,
        workoutDate,
      ]);
      return result as any[];
    } else {
      console.log("use pool");
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
};
