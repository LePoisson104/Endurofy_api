import pool from "../../../config/db.config";
import { ExerciseRequest } from "../interfaces/workout-program.interface";

const GetWorkoutProgram = async (
  userId: string,
  connection?: any
): Promise<any> => {
  const query = "SELECT * FROM programs WHERE user_id = ?";
  if (connection) {
    const [result] = await connection.execute(query, [userId]);
    return result;
  } else {
    const [result] = await pool.execute(query, [userId]);
    return result;
  }
};

const GetWorkoutProgramDays = async (
  programId: string,
  connection?: any
): Promise<any> => {
  const query = "SELECT * FROM program_days WHERE program_id = ?";
  if (connection) {
    const [result] = await connection.execute(query, [programId]);
    return result;
  } else {
    const [result] = await pool.execute(query, [programId]);
    return result;
  }
};

const GetProgramDaysExercises = async (
  programDayId: string,
  connection?: any
): Promise<any> => {
  const query = "SELECT * FROM program_exercises WHERE program_day_id = ?";
  if (connection) {
    const [result] = await connection.execute(query, [programDayId]);
    return result;
  } else {
    const [result] = await pool.execute(query, [programDayId]);
    return result;
  }
};

const AddExercise = async (
  dayId: string,
  exerciseId: string,
  exercise: ExerciseRequest,
  connection?: any
): Promise<any> => {
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
};

const AddProgramDay = async (
  programId: string,
  dayId: string,
  dayName: string,
  dayNumber: number,
  connection?: any
): Promise<any> => {
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
};

const UpdateWorkoutProgramDescription = async (
  userId: string,
  programId: string,
  programName: string,
  description: string,
  startingDate: Date,
  connection?: any
): Promise<any> => {
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
};

const UpdateWorkoutProgramDay = async (
  programId: string,
  dayId: string,
  dayName: string,
  connection?: any
): Promise<any> => {
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
};

const ReorderExerciseOrder = async (
  dayId: string,
  exerciseId: string,
  exerciseOrder: number,
  connection?: any
): Promise<any> => {
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
};

const IfProgramAndProgramDayExists = async (
  programId: string,
  dayId: string,
  connection?: any
): Promise<any> => {
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
};

const UpdateWorkoutProgramExercise = async (
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
};

const DeleteWorkoutProgram = async (
  userId: string,
  programId: string,
  connection?: any
): Promise<any> => {
  const query = "DELETE FROM programs WHERE user_id = ? AND program_id = ?";
  if (connection) {
    const [result] = await connection.execute(query, [userId, programId]);
    return result;
  } else {
    const [result] = await pool.execute(query, [userId, programId]);
    return result;
  }
};

const DeleteWorkoutProgramDay = async (
  programId: string,
  dayId: string,
  connection?: any
): Promise<any> => {
  const query =
    "DELETE FROM program_days WHERE program_id = ? AND program_day_id = ?";
  if (connection) {
    const [result] = await connection.execute(query, [programId, dayId]);
    return result;
  } else {
    const [result] = await pool.execute(query, [programId, dayId]);
    return result;
  }
};

const DeleteWorkoutProgramExercise = async (
  dayId: string,
  exerciseId: string,
  connection?: any
): Promise<any> => {
  const query =
    "DELETE FROM program_exercises WHERE program_day_id = ? AND program_exercise_id = ?";
  if (connection) {
    const [result] = await connection.execute(query, [dayId, exerciseId]);
    return result;
  } else {
    const [result] = await pool.execute(query, [dayId, exerciseId]);
    return result;
  }
};

const UpdateWorkoutProgramUpdatedAt = async (
  programId: string,
  connection?: any
): Promise<any> => {
  const query =
    "UPDATE programs SET updated_at = CONVERT_TZ(NOW(), '+00:00', '-06:00') WHERE program_id = ?";
  if (connection) {
    const [result] = await connection.execute(query, [programId]);
    return result;
  } else {
    const [result] = await pool.execute(query, [programId]);
    return result;
  }
};

const SetProgramAsInactive = async (
  userId: string,
  programId: string,
  connection?: any
): Promise<any> => {
  const query =
    "UPDATE programs SET is_active = 0 WHERE user_id = ? AND program_id = ?";
  if (connection) {
    const [result] = await connection.execute(query, [userId, programId]);
    return result;
  } else {
    const [result] = await pool.execute(query, [userId, programId]);
    return result;
  }
};

const SetAllAsInactive = async (
  userId: string,
  connection?: any
): Promise<any> => {
  const query = "UPDATE programs SET is_active = 0 WHERE user_id = ?";
  if (connection) {
    const [result] = await connection.execute(query, [userId]);
    return result;
  } else {
    const [result] = await pool.execute(query, [userId]);
    return result;
  }
};

const SetProgramAsActive = async (
  userId: string,
  programId: string,
  connection?: any
): Promise<any> => {
  const query =
    "UPDATE programs SET is_active = 1 WHERE user_id = ? AND program_id = ?";
  if (connection) {
    const [result] = await connection.execute(query, [userId, programId]);
    return result;
  } else {
    const [result] = await pool.execute(query, [userId, programId]);
    return result;
  }
};

export default {
  GetWorkoutProgram,
  GetWorkoutProgramDays,
  GetProgramDaysExercises,
  DeleteWorkoutProgram,
  DeleteWorkoutProgramDay,
  DeleteWorkoutProgramExercise,
  UpdateWorkoutProgramDescription,
  UpdateWorkoutProgramDay,
  UpdateWorkoutProgramExercise,
  UpdateWorkoutProgramUpdatedAt,
  AddExercise,
  IfProgramAndProgramDayExists,
  AddProgramDay,
  ReorderExerciseOrder,
  SetProgramAsInactive,
  SetAllAsInactive,
  SetProgramAsActive,
};
