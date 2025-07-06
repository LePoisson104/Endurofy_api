import pool from "../../../config/db.config";
import { WorkoutLogExists } from "../interfaces/workout-log.interfaces";
import { AppError } from "../middlewares/error.handlers";
import Logger from "../utils/logger";

const queryGetWorkoutLogPagination = async (
  programId: string,
  limit: number,
  offset: number,
  connection: any
): Promise<any> => {
  try {
    // Validate and sanitize limit and offset to prevent injection
    const limitInt = Math.max(
      1,
      Math.min(parseInt(limit.toString(), 10) || 10, 100)
    ); // Cap between 1-100
    const offsetInt = Math.max(0, parseInt(offset.toString(), 10) || 0); // Minimum 0

    // Validate that they are actually numbers after parsing
    if (isNaN(limitInt) || isNaN(offsetInt)) {
      throw new Error("Invalid limit or offset values");
    }

    const query = `
    SELECT * FROM workout_logs 
    WHERE program_id = ?
    ORDER BY workout_date DESC
    LIMIT ? OFFSET ?`;

    // Use connection.query instead of connection.execute for better LIMIT/OFFSET support
    const [result] = await connection.query(query, [
      programId,
      limitInt,
      offsetInt,
    ]);
    return result as any[];
  } catch (err) {
    Logger.logEvents(
      `Error getting workout log pagination: ${err}`,
      "errLog.log"
    );
    throw new AppError("Error getting workout log pagination", 500);
  }
};

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

const queryGetWorkoutExercisesAndSets = async (
  userId: string,
  programId: string,
  workoutLogResults: WorkoutLogExists[],
  connection?: any
) => {
  try {
    const workoutLogsData = await Promise.all(
      workoutLogResults.map(async (workoutLog: any) => {
        // Get workout exercises for this workout log using same connection
        const [workoutExercisesResult] = (await connection.execute(
          `SELECT 
            we.workout_exercise_id,
            we.workout_log_id,
            we.program_exercise_id,
            we.exercise_name,
            we.body_part,
            we.laterality,
            we.exercise_order,
            we.notes
          FROM workout_exercises we 
          WHERE we.workout_log_id = ?
          ORDER BY we.exercise_order`,
          [workoutLog.workout_log_id]
        )) as any[];

        // Get workout sets for all exercises using same connection
        const workoutExercises = await Promise.all(
          (workoutExercisesResult as any[]).map(async (exercise) => {
            const [workoutSetsResult] = (await connection.execute(
              `SELECT 
                ws.workout_set_id,
                ws.workout_exercise_id,
                ws.set_number,
                ws.reps_left,
                ws.reps_right,
                ws.weight,
                ws.weight_unit
              FROM workout_sets ws 
              WHERE ws.workout_exercise_id = ?
              ORDER BY ws.set_number`,
              [exercise.workout_exercise_id]
            )) as any[];

            // Get previous workout data for each set
            const workoutSetsWithPrevious = await Promise.all(
              (workoutSetsResult as any[]).map(async (set) => {
                // Get previous workout log data for this specific exercise and set number
                const previousWorkoutLogResult =
                  await queryPreviousWorkoutLogForExercise(
                    userId,
                    programId,
                    workoutLog.day_id,
                    exercise.program_exercise_id,
                    set.set_number,
                    workoutLog.workout_date,
                    connection
                  );

                return {
                  workoutSetId: set.workout_set_id,
                  workoutExerciseId: set.workout_exercise_id,
                  setNumber: set.set_number,
                  repsLeft: set.reps_left,
                  repsRight: set.reps_right,
                  weight: parseFloat(set.weight),
                  weightUnit: set.weight_unit,
                  previousLeftReps:
                    previousWorkoutLogResult.length > 0
                      ? previousWorkoutLogResult[0].leftReps
                      : null,
                  previousRightReps:
                    previousWorkoutLogResult.length > 0
                      ? previousWorkoutLogResult[0].rightReps
                      : null,
                  previousWeight:
                    previousWorkoutLogResult.length > 0
                      ? parseFloat(previousWorkoutLogResult[0].weight)
                      : null,
                  previousWeightUnit:
                    previousWorkoutLogResult.length > 0
                      ? previousWorkoutLogResult[0].weightUnit
                      : null,
                };
              })
            );

            return {
              workoutExerciseId: exercise.workout_exercise_id,
              workoutLogId: exercise.workout_log_id,
              programExerciseId: exercise.program_exercise_id,
              exerciseName: exercise.exercise_name,
              bodyPart: exercise.body_part,
              laterality: exercise.laterality,
              exerciseOrder: exercise.exercise_order,
              notes: exercise.notes,
              workoutSets: workoutSetsWithPrevious,
            };
          })
        );

        // Construct WorkoutLogData object for this workout log
        return {
          workoutLogId: workoutLog.workout_log_id,
          userId: workoutLog.user_id,
          programId: workoutLog.program_id,
          dayId: workoutLog.day_id,
          title: workoutLog.title,
          workoutDate: new Date(workoutLog.workout_date),
          status: workoutLog.status,
          workoutExercises: workoutExercises,
        };
      })
    );
    return workoutLogsData;
  } catch (err) {
    Logger.logEvents(
      `Error getting workout exercises and sets: ${err}`,
      "errLog.log"
    );
    throw new AppError("Error getting workout exercises and sets", 500);
  }
};

const queryGetCompletedWorkoutLogs = async (
  userId: string,
  programId: string,
  startDate: Date,
  endDate: Date
): Promise<number> => {
  try {
    const query = `
      SELECT COUNT(*) AS count
      FROM workout_logs
      WHERE user_id = ? AND program_id = ? AND workout_date BETWEEN ? AND ? AND status = 'completed'
    `;

    const [rows] = await pool.execute(query, [
      userId,
      programId,
      startDate,
      endDate,
    ]);

    const count = (rows as any[])[0]?.count ?? 0;
    return count;
  } catch (err) {
    Logger.logEvents(
      `Error getting completed workout logs: ${err}`,
      "errLog.log"
    );
    return 0; // Fallback to avoid undefined
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

const queryUpdateWorkoutLogName = async (
  workoutLogId: string,
  title: string
): Promise<any> => {
  try {
    const query = "UPDATE workout_logs SET title = ? WHERE workout_log_id = ?";

    const [result] = await pool.execute(query, [title, workoutLogId]);
    return result as any[];
  } catch (err) {
    Logger.logEvents(`Error updating workout log name: ${err}`, "errLog.log");
    throw new AppError("Database error while updating workout log name", 500);
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
        ws.set_number as setNumber,
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

const queryGetExercisesByDayId = async (
  dayId: string,
  connection?: any
): Promise<any> => {
  try {
    const query = `
      SELECT 
        pe.program_exercise_id,
        pe.exercise_name,
        pe.body_part,
        pe.laterality,
        pe.sets,
        pe.min_reps,
        pe.max_reps,
        pe.exercise_order
      FROM program_exercises pe
      WHERE pe.program_day_id = ?
      ORDER BY pe.exercise_order
    `;

    if (connection) {
      const [result] = await connection.execute(query, [dayId]);
      return result as any[];
    } else {
      const [result] = await pool.execute(query, [dayId]);
      return result as any[];
    }
  } catch (err) {
    Logger.logEvents(`Error getting exercises by day id: ${err}`, "errLog.log");
    throw new AppError("Database error while getting exercises by day id", 500);
  }
};

const queryAddWorkoutSet = async (
  workoutSetId: string,
  workoutExerciseId: string,
  setNumber: number,
  repsLeft: number,
  repsRight: number,
  weight: number,
  weightUnit: string
): Promise<any> => {
  try {
    const query =
      "INSERT INTO workout_sets (workout_set_id, workout_exercise_id, set_number, reps_left, reps_right, weight, weight_unit) VALUES (?, ?, ?, ?, ?, ?, ?)";

    const [result] = await pool.execute(query, [
      workoutSetId,
      workoutExerciseId,
      setNumber,
      repsLeft,
      repsRight,
      weight,
      weightUnit,
    ]);
    return result as any[];
  } catch (err) {
    Logger.logEvents(`Error adding workout set: ${err}`, "errLog.log");
    throw new AppError("Database error while adding workout set", 500);
  }
};

const queryCreateManualWorkoutLog = async (
  workoutLogId: string,
  userId: string,
  programId: string,
  dayId: string,
  title: string,
  workoutDate: string,
  status: string,
  connection?: any
): Promise<any> => {
  try {
    const query =
      "INSERT INTO workout_logs (workout_log_id,user_id,  program_id, day_id, title, workout_date, status  ) VALUES (?, ?, ?, ?, ?, ?, ?)";

    if (connection) {
      const [result] = await connection.execute(query, [
        workoutLogId,
        userId,
        programId,
        dayId,
        title,
        workoutDate,
        status,
      ]);
      return result as any[];
    } else {
      const [result] = await pool.execute(query, [
        userId,
        programId,
        dayId,
        title,
        workoutDate,
      ]);
      return result as any[];
    }
  } catch (err) {
    Logger.logEvents(`Error creating manual workout log: ${err}`, "errLog.log");
    throw new AppError("Database error while creating manual workout log", 500);
  }
};

const queryAddManualWorkoutExercise = async (
  workoutExerciseId: string,
  workoutLogId: string,
  programExerciseId: string,
  workoutLogPayload: {
    exerciseName: string;
    bodyPart: string;
    laterality: string;
    exerciseOrder: number;
  }
): Promise<any> => {
  try {
    const query =
      "INSERT INTO workout_exercises (workout_exercise_id, workout_log_id, program_exercise_id, exercise_name, body_part, laterality, exercise_order, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const { exerciseName, bodyPart, laterality, exerciseOrder } =
      workoutLogPayload;

    const [result] = await pool.execute(query, [
      workoutExerciseId,
      workoutLogId,
      programExerciseId,
      exerciseName,
      bodyPart,
      laterality,
      exerciseOrder,
      "",
    ]);
    return result as any[];
  } catch (err) {
    Logger.logEvents(
      `Error adding manual workout exercise: ${err}`,
      "errLog.log"
    );
    throw new AppError(
      "Database error while adding manual workout exercise",
      500
    );
  }
};

const queryDeleteWorkoutSet = async (workoutSetId: string): Promise<any> => {
  try {
    const query = "DELETE FROM workout_sets WHERE workout_set_id = ?";
    const [result] = await pool.execute(query, [workoutSetId]);
    return result as any[];
  } catch (err) {
    Logger.logEvents(`Error deleting workout set: ${err}`, "errLog.log");
    throw new AppError("Database error while deleting workout set", 500);
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
  queryUpdateWorkoutLogName,
  queryPreviousWorkoutLogForExercise,
  queryGetCompletedWorkoutLogs,
  queryGetExercisesByDayId,
  queryGetWorkoutExercisesAndSets,
  queryGetWorkoutLogPagination,
  queryCreateManualWorkoutLog,
  queryAddManualWorkoutExercise,
  queryAddWorkoutSet,
  queryDeleteWorkoutSet,
};
