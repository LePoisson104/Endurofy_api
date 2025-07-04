import pool from "../../../config/db.config";
import { ExerciseRequest } from "../interfaces/workout-program.interface";
import { AppError } from "../middlewares/error.handlers";
import Logger from "../utils/logger";

const queryGetWorkoutProgram = async (
  userId: string,
  connection?: any
): Promise<any> => {
  try {
    const query = "SELECT * FROM programs WHERE user_id = ?";
    if (connection) {
      const [result] = await connection.execute(query, [userId]);
      return result;
    } else {
      const [result] = await pool.execute(query, [userId]);
      return result;
    }
  } catch (err) {
    Logger.logEvents(`Error getting workout program: ${err}`, "errLog.log");
    throw new AppError("Database error while getting workout program", 500);
  }
};

const queryGetWorkoutProgramDays = async (
  programId: string,
  connection?: any
): Promise<any> => {
  try {
    const query = "SELECT * FROM program_days WHERE program_id = ?";
    if (connection) {
      const [result] = await connection.execute(query, [programId]);
      return result;
    } else {
      const [result] = await pool.execute(query, [programId]);
      return result;
    }
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
  programDayId: string,
  connection?: any
): Promise<any> => {
  try {
    const query = "SELECT * FROM program_exercises WHERE program_day_id = ?";
    if (connection) {
      const [result] = await connection.execute(query, [programDayId]);
      return result;
    } else {
      const [result] = await pool.execute(query, [programDayId]);
      return result;
    }
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

const queryAddExercise = async (
  dayId: string,
  exerciseId: string,
  exercise: ExerciseRequest,
  connection?: any
): Promise<any> => {
  try {
    const query =
      "INSERT INTO program_exercises (program_exercise_id, program_day_id, exercise_name, body_part, laterality, sets, min_reps, max_reps, exercise_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    if (connection) {
      const [result] = await connection.execute(query, [
        exerciseId,
        dayId,
        exercise.exerciseName,
        exercise.bodyPart,
        exercise.laterality,
        exercise.sets,
        exercise.minReps,
        exercise.maxReps,
        exercise.exerciseOrder,
      ]);
      return result;
    } else {
      const [result] = await pool.execute(query, [
        exerciseId,
        dayId,
        exercise.exerciseName,
        exercise.bodyPart,
        exercise.laterality,
        exercise.sets,
        exercise.minReps,
        exercise.maxReps,
        exercise.exerciseOrder,
      ]);
      return result;
    }
  } catch (err) {
    Logger.logEvents(`Error adding exercise: ${err}`, "errLog.log");
    throw new AppError("Database error while adding exercise", 500);
  }
};

const queryAddProgramDay = async (
  programId: string,
  dayId: string,
  dayName: string,
  dayNumber: number,
  connection?: any
): Promise<any> => {
  try {
    const query =
      "INSERT INTO program_days (program_day_id, program_id, day_number, day_name) VALUES (?, ?, ?, ?)";
    if (connection) {
      const [result] = await connection.execute(query, [
        dayId,
        programId,
        dayNumber,
        dayName,
      ]);
      return result;
    } else {
      const [result] = await pool.execute(query, [
        dayId,
        programId,
        dayNumber,
        dayName,
      ]);
      return result;
    }
  } catch (err) {
    Logger.logEvents(`Error adding program day: ${err}`, "errLog.log");
    throw new AppError("Database error while adding program day", 500);
  }
};

const queryUpdateWorkoutProgramDescription = async (
  userId: string,
  programId: string,
  programName: string,
  description: string,
  startingDate: Date,
  connection?: any
): Promise<any> => {
  try {
    const query =
      "UPDATE programs SET program_name = ?, description = ?, starting_date = ? WHERE user_id = ? AND program_id = ?";
    if (connection) {
      const [result] = await connection.execute(query, [
        programName,
        description,
        startingDate,
        userId,
        programId,
      ]);
      return result;
    } else {
      const [result] = await pool.execute(query, [
        programName,
        description,
        startingDate,
        userId,
        programId,
      ]);
      return result;
    }
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
  dayName: string,
  connection?: any
): Promise<any> => {
  try {
    const query =
      "UPDATE program_days SET day_name = ? WHERE program_id = ? AND program_day_id = ?";
    if (connection) {
      const [result] = await connection.execute(query, [
        dayName,
        programId,
        dayId,
      ]);
      return result;
    } else {
      const [result] = await pool.execute(query, [dayName, programId, dayId]);
      return result;
    }
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

const queryReorderExerciseOrder = async (
  dayId: string,
  exerciseId: string,
  exerciseOrder: number,
  connection?: any
): Promise<any> => {
  try {
    const query =
      "UPDATE program_exercises SET exercise_order = ? WHERE program_day_id = ? AND program_exercise_id = ?";
    if (connection) {
      const [result] = await connection.execute(query, [
        exerciseOrder,
        dayId,
        exerciseId,
      ]);
      return result;
    } else {
      const [result] = await pool.execute(query, [
        exerciseOrder,
        dayId,
        exerciseId,
      ]);
      return result;
    }
  } catch (err) {
    Logger.logEvents(`Error reordering exercise order: ${err}`, "errLog.log");
    throw new AppError("Database error while reordering exercise order", 500);
  }
};

const queryIfProgramAndProgramDayExists = async (
  programId: string,
  dayId: string,
  connection?: any
): Promise<any> => {
  try {
    const query =
      "SELECT * FROM program_days WHERE program_id = ? AND program_day_id = ?";
    if (connection) {
      const [result] = await connection.execute(query, [programId, dayId]);
      if ((result as any[]).length === 0) {
        return false;
      }
      return true;
    } else {
      const [result] = await pool.execute(query, [programId, dayId]);
      if ((result as any[]).length === 0) {
        return false;
      }
      return true;
    }
  } catch (err) {
    Logger.logEvents(
      `Error checking if program day exists: ${err}`,
      "errLog.log"
    );
    throw new AppError(
      "Database error while checking if program day exists",
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
  exerciseOrder: number,
  connection?: any
): Promise<any> => {
  try {
    const query =
      "UPDATE program_exercises SET exercise_name = ?, body_part = ?, laterality = ?, sets = ?, min_reps = ?, max_reps = ?, exercise_order = ? WHERE program_day_id = ? AND program_exercise_id = ?";
    if (connection) {
      const [result] = await connection.execute(query, [
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
    } else {
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
    }
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
  programId: string,
  connection?: any
): Promise<any> => {
  try {
    const query = "DELETE FROM programs WHERE user_id = ? AND program_id = ?";
    if (connection) {
      const [result] = await connection.execute(query, [userId, programId]);
      return result;
    } else {
      const [result] = await pool.execute(query, [userId, programId]);
      return result;
    }
  } catch (err) {
    Logger.logEvents(`Error deleting workout program: ${err}`, "errLog.log");
    throw new AppError("Database error while deleting workout program", 500);
  }
};

const queryDeleteWorkoutProgramDay = async (
  programId: string,
  dayId: string,
  connection?: any
): Promise<any> => {
  try {
    const query =
      "DELETE FROM program_days WHERE program_id = ? AND program_day_id = ?";
    if (connection) {
      const [result] = await connection.execute(query, [programId, dayId]);
      return result;
    } else {
      const [result] = await pool.execute(query, [programId, dayId]);
      return result;
    }
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
  exerciseId: string,
  connection?: any
): Promise<any> => {
  try {
    const query =
      "DELETE FROM program_exercises WHERE program_day_id = ? AND program_exercise_id = ?";
    if (connection) {
      const [result] = await connection.execute(query, [dayId, exerciseId]);
      return result;
    } else {
      const [result] = await pool.execute(query, [dayId, exerciseId]);
      return result;
    }
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
  programId: string,
  connection?: any
): Promise<any> => {
  try {
    const query = "UPDATE programs SET updated_at = NOW() WHERE program_id = ?";
    if (connection) {
      const [result] = await connection.execute(query, [programId]);
      return result;
    } else {
      const [result] = await pool.execute(query, [programId]);
      return result;
    }
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

const querySetProgramAsInactive = async (
  userId: string,
  programId: string,
  connection?: any
): Promise<any> => {
  try {
    const query =
      "UPDATE programs SET is_active = 0 WHERE user_id = ? AND program_id = ?";
    if (connection) {
      const [result] = await connection.execute(query, [userId, programId]);
      return result;
    } else {
      const [result] = await pool.execute(query, [userId, programId]);
      return result;
    }
  } catch (err) {
    Logger.logEvents(`Error setting program as inactive: ${err}`, "errLog.log");
    throw new AppError("Database error while setting program as inactive", 500);
  }
};

const querySetAllAsInactive = async (
  userId: string,
  connection?: any
): Promise<any> => {
  try {
    const query = "UPDATE programs SET is_active = 0 WHERE user_id = ?";
    if (connection) {
      const [result] = await connection.execute(query, [userId]);
      return result;
    } else {
      const [result] = await pool.execute(query, [userId]);
      return result;
    }
  } catch (err) {
    Logger.logEvents(
      `Error setting all programs as inactive: ${err}`,
      "errLog.log"
    );
    throw new AppError(
      "Database error while setting all programs as inactive",
      500
    );
  }
};

const querySetProgramAsActive = async (
  userId: string,
  programId: string,
  connection?: any
): Promise<any> => {
  try {
    const query =
      "UPDATE programs SET is_active = 1 WHERE user_id = ? AND program_id = ?";
    if (connection) {
      const [result] = await connection.execute(query, [userId, programId]);
      return result;
    } else {
      const [result] = await pool.execute(query, [userId, programId]);
      return result;
    }
  } catch (err) {
    Logger.logEvents(`Error setting program as active: ${err}`, "errLog.log");
    throw new AppError("Database error while setting program as active", 500);
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
  queryAddExercise,
  queryIfProgramAndProgramDayExists,
  queryAddProgramDay,
  queryReorderExerciseOrder,
  querySetProgramAsInactive,
  querySetAllAsInactive,
  querySetProgramAsActive,
};
