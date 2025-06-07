import { AppError } from "../middlewares/error.handlers";
import { v4 as uuidv4 } from "uuid";
import { WorkoutRequestPayload } from "../interfaces/workout-log.interfaces";
import pool from "../../../config/db.config";
import Logger from "../utils/logger";
import workoutLogRepository from "../repositories/workout-log.repositories";

const createWorkoutLog = async (
  userId: string,
  programId: string,
  workoutLogPayload: WorkoutRequestPayload
): Promise<{ data: { message: string } }> => {
  const {
    programExerciseId,
    title,
    workoutDate,
    notes,
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
        "INSERT INTO workout_logs (workout_log_id, user_id, program_id, title, notes, workout_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          currentWorkoutLogId,
          userId,
          programId,
          title,
          notes,
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
        "INSERT INTO workout_exercises (workout_exercise_id, workout_log_id, program_exercise_id, exercise_name, body_part, laterality, exercise_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          currentWorkoutExerciseId,
          currentWorkoutLogId,
          programExerciseId,
          exerciseName,
          bodyPart,
          laterality,
          exerciseOrder,
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

const setWorkoutLogComplete = async (workoutLogId: string, notes: string) => {
  const connection = await pool.getConnection();

  try {
    await connection.execute(
      "UPDATE workout_logs SET status = 'completed', notes = ? WHERE workout_log_id = ?",
      [notes, workoutLogId]
    );

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    Logger.logEvents(`Error updating workout log status: ${err}`, "errLog.log");
    throw new AppError("Database error while updating workout log status", 500);
  } finally {
    connection.release();
  }
};

const updateWorkoutLogNotes = async (workoutLogId: string, notes: string) => {
  const connection = await pool.getConnection();

  try {
    await connection.execute(
      "UPDATE workout_logs SET notes = ? WHERE workout_log_id = ?",
      [notes, workoutLogId]
    );

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    Logger.logEvents(`Error updating workout log notes: ${err}`, "errLog.log");
    throw new AppError("Database error while updating workout log notes", 500);
  } finally {
    connection.release();
  }
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

const updateWorkoutSet = async (
  workoutSetId: string,
  workoutExerciseId: string,
  workoutSetPayload: {
    repsLeft: number;
    repsRight: number;
    weight: number;
    weightUnit: string;
  }
) => {
  const { repsLeft, repsRight, weight, weightUnit } = workoutSetPayload;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.execute(
      "UPDATE workout_sets SET reps_left = ?, reps_right = ?, weight = ?, weight_unit = ? WHERE workout_set_id = ? AND workout_exercise_id = ?",
      [repsLeft, repsRight, weight, weightUnit, workoutSetId, workoutExerciseId]
    );

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    Logger.logEvents(`Error updating workout set: ${err}`, "errLog.log");
    throw new AppError("Database error while updating workout set", 500);
  } finally {
    connection.release();
  }
};

const deleteWorkoutSet = async (
  workoutSetId: string,
  workoutExerciseId: string
) => {
  const connection = await pool.getConnection();

  try {
    await connection.execute(
      "DELETE FROM workout_sets WHERE workout_set_id = ? AND workout_exercise_id = ?",
      [workoutSetId, workoutExerciseId]
    );

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    Logger.logEvents(`Error deleting workout set: ${err}`, "errLog.log");
    throw new AppError("Database error while deleting workout set", 500);
  } finally {
    connection.release();
  }
};

const deleteWorkoutExercise = async (
  workoutExerciseId: string,
  workoutLogId: string
) => {
  const connection = await pool.getConnection();

  try {
    await connection.execute(
      "DELETE FROM workout_exercises WHERE workout_exercise_id = ? AND workout_log_id = ?",
      [workoutExerciseId, workoutLogId]
    );

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    Logger.logEvents(`Error deleting workout exercise: ${err}`, "errLog.log");
  } finally {
    connection.release();
  }
};

export default {
  createWorkoutLog,
  updateWorkoutSet,
  deleteWorkoutSet,
  deleteWorkoutLog,
  setWorkoutLogComplete,
  deleteWorkoutExercise,
  updateWorkoutLogNotes,
};
