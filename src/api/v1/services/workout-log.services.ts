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

  const workoutLogExists = await workoutLogRepository.queryIsWorkoutLogExists(
    userId,
    programId,
    workoutDate
  );

  try {
    connection.beginTransaction();

    const workoutLogId = uuidv4();
    if (workoutLogExists.length === 0) {
      await connection.execute(
        "INSERT INTO workout_logs (workout_log_id, user_id, program_id, title, notes, workout_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          workoutLogId,
          userId,
          programId,
          title,
          notes,
          workoutDate,
          "incomplete",
        ]
      );
    }

    const workoutExerciseId = uuidv4();
    await connection.execute(
      "INSERT INTO workout_exercises (workout_exercise_id, workout_log_id, program_exercise_id, exercise_name, body_part, laterality, exercise_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        workoutExerciseId,
        workoutLogExists.length > 0
          ? workoutLogExists[0].workout_log_id
          : workoutLogId,
        programExerciseId,
        exerciseName,
        bodyPart,
        laterality,
        exerciseOrder,
      ]
    );

    const workoutSetId = uuidv4();
    await connection.execute(
      "INSERT INTO workout_sets (workout_set_id, workout_exercise_id, set_number, reps_left, reps_right, weight, weight_unit) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        workoutSetId,
        workoutExerciseId,
        setNumber,
        repsLeft,
        repsRight,
        weight,
        weightUnit,
      ]
    );

    await connection.commit();
  } catch (err) {
    connection.rollback();
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

export default {
  createWorkoutLog,
};
