import { AppError } from "../middlewares/error.handlers";
import { v4 as uuidv4 } from "uuid";
import {
  WorkoutLogData,
  WorkoutRequestPayload,
} from "../interfaces/workout-log.interfaces";
import pool from "../../../config/db.config";
import Logger from "../utils/logger";
import workoutLogRepository from "../repositories/workout-log.repositories";

const getWorkoutLogDates = async (
  userId: string,
  programId: string,
  startDate: string,
  endDate: string
): Promise<{ data: WorkoutLogData[] }> => {
  const workoutLogDates = await workoutLogRepository.queryGetWorkoutLogDates(
    userId,
    programId,
    startDate,
    endDate
  );

  return { data: workoutLogDates };
};

const getWorkoutLogData = async (
  userId: string,
  programId: string,
  startDate: string,
  endDate: string
): Promise<{ data: WorkoutLogData[] }> => {
  const connection = await pool.getConnection();

  try {
    let workoutLogResults;

    // Check if startDate and endDate are the same (single date query)
    if (startDate === endDate) {
      // Use the existing single date query method
      workoutLogResults = await workoutLogRepository.queryIsWorkoutLogExists(
        userId,
        programId,
        startDate,
        connection
      );
    } else {
      // Use the date range query method
      workoutLogResults =
        await workoutLogRepository.queryWorkoutLogsByDateRange(
          userId,
          programId,
          startDate,
          endDate,
          connection
        );
    }

    if (workoutLogResults.length === 0) {
      return { data: [] };
    }

    // Process each workout log
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

            return {
              workoutExerciseId: exercise.workout_exercise_id,
              workoutLogId: exercise.workout_log_id,
              programExerciseId: exercise.program_exercise_id,
              exerciseName: exercise.exercise_name,
              bodyPart: exercise.body_part,
              laterality: exercise.laterality,
              exerciseOrder: exercise.exercise_order,
              notes: exercise.notes,
              workoutSets: (workoutSetsResult as any[]).map((set) => ({
                workoutSetId: set.workout_set_id,
                workoutExerciseId: set.workout_exercise_id,
                setNumber: set.set_number,
                repsLeft: set.reps_left,
                repsRight: set.reps_right,
                weight: parseFloat(set.weight),
                weightUnit: set.weight_unit,
              })),
            };
          })
        );

        // Construct WorkoutLogData object for this workout log
        return {
          workoutLogId: workoutLog.workout_log_id,
          userId: workoutLog.user_id,
          programId: workoutLog.program_id,
          title: workoutLog.title,
          workoutDate: new Date(workoutLog.workout_date),
          status: workoutLog.status,
          workoutExercises: workoutExercises,
        };
      })
    );

    return { data: workoutLogsData };
  } catch (err) {
    Logger.logEvents(`Error getting workout log data: ${err}`, "errLog.log");
    throw new AppError("Error getting workout log data", 500);
  } finally {
    connection.release();
  }
};

const createWorkoutLog = async (
  userId: string,
  programId: string,
  workoutLogPayload: WorkoutRequestPayload
): Promise<{ data: { message: string } }> => {
  const {
    programExerciseId,
    workoutName,
    workoutDate,
    exerciseNotes,
    exerciseName,
    bodyPart,
    laterality,
    setNumber,
    repsLeft,
    repsRight,
    weight,
    weightUnit,
    exerciseOrder,
  } = workoutLogPayload;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let currentWorkoutLogId: string;

    // Check if workout log exists using same connection
    const workoutLogResult = await workoutLogRepository.queryIsWorkoutLogExists(
      userId,
      programId,
      workoutDate,
      connection
    );

    if (workoutLogResult.length === 0) {
      // Create new workout log
      currentWorkoutLogId = uuidv4();
      await connection.execute(
        "INSERT INTO workout_logs (workout_log_id, user_id, program_id, title, workout_date, status) VALUES (?, ?, ?, ?, ?, ?)",
        [
          currentWorkoutLogId,
          userId,
          programId,
          workoutName,
          workoutDate,
          "incomplete",
        ]
      );
    } else {
      // Use existing workout log
      currentWorkoutLogId = workoutLogResult[0].workout_log_id;
    }

    let currentWorkoutExerciseId: string;

    // Check if workout exercise exists using same connection
    const workoutExerciseResult =
      await workoutLogRepository.queryIsWorkoutExerciseExists(
        currentWorkoutLogId,
        programExerciseId,
        connection
      );

    if (workoutExerciseResult.length === 0) {
      // Create new workout exercise
      currentWorkoutExerciseId = uuidv4();
      await connection.execute(
        "INSERT INTO workout_exercises (workout_exercise_id, workout_log_id, program_exercise_id, exercise_name, body_part, laterality, exercise_order, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          currentWorkoutExerciseId,
          currentWorkoutLogId,
          programExerciseId,
          exerciseName,
          bodyPart,
          laterality,
          exerciseOrder,
          exerciseNotes,
        ]
      );
    } else {
      // Use existing workout exercise
      currentWorkoutExerciseId = workoutExerciseResult[0].workout_exercise_id;
    }

    // Always create new workout set
    const workoutSetId = uuidv4();
    await connection.execute(
      "INSERT INTO workout_sets (workout_set_id, workout_exercise_id, set_number, reps_left, reps_right, weight, weight_unit) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        workoutSetId,
        currentWorkoutExerciseId,
        setNumber,
        repsLeft,
        repsRight,
        weight,
        weightUnit,
      ]
    );

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    Logger.logEvents(`Error creating workout log: ${err}`, "errLog.log");
    throw new AppError("Database error while creating workout log", 500);
  } finally {
    connection.release();
  }

  return {
    data: {
      message: "Workout log created successfully",
    },
  };
};

const updateWorkoutLogStatus = async (
  workoutLogId: string,
  status: string
): Promise<{ data: { message: string } }> => {
  const result = await workoutLogRepository.queryUpdateWorkoutLogStatus(
    workoutLogId,
    status
  );

  if (result.affectedRows === 0) {
    throw new AppError("Invalid workout log id", 400);
  }

  return {
    data: {
      message: "Workout log status updated successfully",
    },
  };
};

const deleteWorkoutLog = async (workoutLogId: string) => {
  const connection = await pool.getConnection();

  try {
    await connection.execute(
      "DELETE FROM workout_logs WHERE workout_log_id = ?",
      [workoutLogId]
    );

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    Logger.logEvents(`Error deleting workout log: ${err}`, "errLog.log");
    throw new AppError("Database error while deleting workout log", 500);
  } finally {
    connection.release();
  }
};

const updateExerciseNotes = async (
  workoutExerciseId: string,
  exerciseNotes: string
): Promise<{ data: { message: string } }> => {
  if (exerciseNotes.length > 200) {
    throw new AppError("Exercise notes must be less than 200 characters", 400);
  }

  const result = await workoutLogRepository.queryUpdateExerciseNotes(
    workoutExerciseId,
    exerciseNotes
  );

  if (result.length === 0) {
    throw new AppError("Invalid workout exercise id", 400);
  }

  return {
    data: {
      message: "Exercise notes updated successfully",
    },
  };
};

const updateWorkoutSet = async (
  workoutSetId: string,
  workoutExerciseId: string,
  workoutSetPayload: {
    leftReps: number;
    rightReps: number;
    weight: number;
    weightUnit: string;
  }
): Promise<{ data: { message: string } }> => {
  const { leftReps, rightReps, weight, weightUnit } = workoutSetPayload;

  const result = await workoutLogRepository.queryUpdateWorkoutSet(
    workoutSetId,
    workoutExerciseId,
    leftReps,
    rightReps,
    weight,
    weightUnit
  );

  if (result.affectedRows === 0) {
    throw new AppError("Invalid workout set id", 400);
  }

  return {
    data: {
      message: "Workout set updated successfully",
    },
  };
};

const deleteWorkoutSetWithCascade = async (
  workoutSetId: string,
  workoutExerciseId: string,
  workoutLogId: string
): Promise<{ data: { message: string } }> => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Step 1: Delete the workout set
    await connection.execute(
      "DELETE FROM workout_sets WHERE workout_set_id = ? AND workout_exercise_id = ?",
      [workoutSetId, workoutExerciseId]
    );

    // Step 2: Check if there are any other sets for this exercise
    const [remainingSetsResult] = (await connection.execute(
      "SELECT COUNT(*) as count FROM workout_sets WHERE workout_exercise_id = ?",
      [workoutExerciseId]
    )) as any[];

    const remainingSetsCount = remainingSetsResult[0].count;

    // If no more sets exist for this exercise, delete the exercise
    if (remainingSetsCount === 0) {
      await connection.execute(
        "DELETE FROM workout_exercises WHERE workout_exercise_id = ?",
        [workoutExerciseId]
      );

      // Step 3: Check if there are any other exercises for this workout log
      const [remainingExercisesResult] = (await connection.execute(
        "SELECT COUNT(*) as count FROM workout_exercises WHERE workout_log_id = ?",
        [workoutLogId]
      )) as any[];

      const remainingExercisesCount = remainingExercisesResult[0].count;

      // If no more exercises exist for this workout log, delete the workout log
      if (remainingExercisesCount === 0) {
        await connection.execute(
          "DELETE FROM workout_logs WHERE workout_log_id = ?",
          [workoutLogId]
        );
      }
    }

    await connection.commit();

    return {
      data: {
        message: "Workout set deleted successfully with cascade cleanup",
      },
    };
  } catch (err) {
    await connection.rollback();
    Logger.logEvents(
      `Error deleting workout set with cascade: ${err}`,
      "errLog.log"
    );
    throw new AppError(
      "Database error while deleting workout set with cascade",
      500
    );
  } finally {
    connection.release();
  }
};

export default {
  createWorkoutLog,
  updateWorkoutLogStatus,
  deleteWorkoutLog,
  updateWorkoutSet,
  deleteWorkoutSetWithCascade,
  getWorkoutLogData,
  updateExerciseNotes,
  getWorkoutLogDates,
};
