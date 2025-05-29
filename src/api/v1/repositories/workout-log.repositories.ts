import pool from "../../../config/db.config";
import { AppError } from "../middlewares/error.handlers";
import Logger from "../utils/logger";

const queryIsWorkoutLogExists = async (
  userId: string,
  programId: string,
  workoutDate: Date
): Promise<any> => {
  try {
    const query = `SELECT * FROM workout_logs WHERE user_id = ? AND program_id = ? AND workout_date = ?`;
    const [result] = await pool.execute(query, [
      userId,
      programId,
      workoutDate,
    ]);
    return result as any[];
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

export default {
  queryIsWorkoutLogExists,
};
