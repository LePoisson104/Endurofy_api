import pool from "../../../config/db.config";
import { WorkoutLogExists } from "../interfaces/workout-log.interfaces";

const GetWorkoutLogPagination = async (
  programId: string,
  limit: number,
  offset: number,
  connection: any
): Promise<any> => {
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
};

const GetWorkoutLogDates = async (
  userId: string,
  programId: string,
  startDate: string,
  endDate: string
): Promise<any> => {
  const query =
    "SELECT workout_date, status FROM workout_logs WHERE user_id = ? AND program_id = ? AND workout_date BETWEEN ? AND ? ORDER BY workout_date ASC";

  const [result] = await pool.execute(query, [
    userId,
    programId,
    startDate,
    endDate,
  ]);
  return result as any[];
};

const GetWorkoutExercisesAndSets = async (
  userId: string,
  programId: string,
  workoutLogResults: WorkoutLogExists[],
  connection?: any
) => {
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
                await GetPreviousWorkoutLogForExerciseByName(
                  userId,
                  programId,
                  workoutLog.day_id,
                  exercise.exercise_name,
                  set.set_number,
                  workoutLog.workout_date,
                  exercise.exercise_order,
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
        timer: workoutLog.timer,
        expectedNumberOfSets: workoutLog.expected_number_of_sets,
        workoutExercises: workoutExercises,
      };
    })
  );
  return workoutLogsData;
};

const GetCompletedWorkoutLogs = async (
  userId: string,
  programId: string,
  startDate: Date,
  endDate: Date
): Promise<number> => {
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
};

const IsWorkoutLogExists = async (
  userId: string,
  programId: string,
  workoutDate: string,
  connection?: any
): Promise<any> => {
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
};

const GetWorkoutLogsByDateRange = async (
  userId: string,
  programId: string,
  startDate: string,
  endDate: string,
  connection?: any
): Promise<any> => {
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
};

const UpdateExerciseNotes = async (
  workoutExerciseId: string,
  exerciseNotes: string
): Promise<any> => {
  const query =
    "UPDATE workout_exercises SET notes = ? WHERE workout_exercise_id = ?";

  const [result] = await pool.execute(query, [
    exerciseNotes,
    workoutExerciseId,
  ]);
  return result as any[];
};

const IsWorkoutExerciseExists = async (
  workoutLogId: string,
  programExerciseId: string,
  connection?: any
): Promise<any> => {
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
};

const UpdateWorkoutSet = async (
  workoutSetId: string,
  workoutExerciseId: string,
  leftReps: number,
  rightReps: number,
  weight: number,
  weightUnit: string
): Promise<any> => {
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
};

const UpdateWorkoutLogName = async (
  workoutLogId: string,
  title: string
): Promise<any> => {
  const query = "UPDATE workout_logs SET title = ? WHERE workout_log_id = ?";

  const [result] = await pool.execute(query, [title, workoutLogId]);
  return result as any[];
};

const UpdateWorkoutLogStatus = async (
  workoutLogId: string,
  status: string
): Promise<any> => {
  const query = "UPDATE workout_logs SET status = ? WHERE workout_log_id = ?";

  const [result] = await pool.execute(query, [status, workoutLogId]);
  return result as any[];
};

const GetPreviousWorkoutLogForExerciseByName = async (
  userId: string,
  programId: string,
  dayId: string,
  exerciseName: string,
  setNumber: number,
  currentWorkoutDate: string,
  currentExerciseOrder: number,
  connection?: any
): Promise<any> => {
  // First, check for same day exercises with lower exercise_order (earlier in the workout)
  const sameDayQuery = `
      SELECT
        ws.set_number as setNumber,
        ws.reps_left as leftReps,
        ws.reps_right as rightReps,
        ws.weight,
        ws.weight_unit as weightUnit,
        we.exercise_order,
        'same_day' as source
      FROM workout_logs wl
      JOIN workout_exercises we ON wl.workout_log_id = we.workout_log_id
      JOIN workout_sets ws ON we.workout_exercise_id = ws.workout_exercise_id
      WHERE wl.user_id = ? 
        AND wl.program_id = ? 
        AND wl.day_id = ? 
        AND we.exercise_name = ?
        AND ws.set_number = ?
        AND wl.workout_date = ?
        AND we.exercise_order < ?
      ORDER BY we.exercise_order DESC
      LIMIT 1
    `;

  // If no same day result, check previous days (use highest exercise_order from previous days)
  const previousDayQuery = `
      SELECT
        ws.set_number as setNumber,
        ws.reps_left as leftReps,
        ws.reps_right as rightReps,
        ws.weight,
        ws.weight_unit as weightUnit,
        we.exercise_order,
        'previous_day' as source
      FROM workout_logs wl
      JOIN workout_exercises we ON wl.workout_log_id = we.workout_log_id
      JOIN workout_sets ws ON we.workout_exercise_id = ws.workout_exercise_id
      WHERE wl.user_id = ? 
        AND wl.program_id = ? 
        AND wl.day_id = ? 
        AND we.exercise_name = ?
        AND ws.set_number = ?
        AND wl.workout_date < ?
      ORDER BY wl.workout_date DESC, we.exercise_order DESC
      LIMIT 1
    `;

  if (connection) {
    // First try same day
    const [sameDayResult] = await connection.execute(sameDayQuery, [
      userId,
      programId,
      dayId,
      exerciseName,
      setNumber,
      currentWorkoutDate,
      currentExerciseOrder,
    ]);

    if ((sameDayResult as any[]).length > 0) {
      return sameDayResult as any[];
    }

    // If no same day result, try previous days
    const [previousDayResult] = await connection.execute(previousDayQuery, [
      userId,
      programId,
      dayId,
      exerciseName,
      setNumber,
      currentWorkoutDate,
    ]);
    return previousDayResult as any[];
  } else {
    // First try same day
    const [sameDayResult] = await pool.execute(sameDayQuery, [
      userId,
      programId,
      dayId,
      exerciseName,
      setNumber,
      currentWorkoutDate,
      currentExerciseOrder,
    ]);

    if ((sameDayResult as any[]).length > 0) {
      return sameDayResult as any[];
    }

    // If no same day result, try previous days
    const [previousDayResult] = await pool.execute(previousDayQuery, [
      userId,
      programId,
      dayId,
      exerciseName,
      setNumber,
      currentWorkoutDate,
    ]);
    return previousDayResult as any[];
  }
};

const GetPreviousWorkoutLogForExercise = async (
  userId: string,
  programId: string,
  dayId: string,
  programExerciseId: string,
  setNumber: number,
  currentWorkoutDate: string,
  currentExerciseOrder: number,
  connection?: any
): Promise<any> => {
  // First, check for same day exercises with lower exercise_order (earlier in the workout)
  const sameDayQuery = `
      SELECT
        ws.set_number as setNumber,
        ws.reps_left as leftReps,
        ws.reps_right as rightReps,
        ws.weight,
        ws.weight_unit as weightUnit,
        we.exercise_order,
        'same_day' as source
      FROM workout_logs wl
      JOIN workout_exercises we ON wl.workout_log_id = we.workout_log_id
      JOIN workout_sets ws ON we.workout_exercise_id = ws.workout_exercise_id
      WHERE wl.user_id = ? 
        AND wl.program_id = ? 
        AND wl.day_id = ? 
        AND we.program_exercise_id = ?
        AND ws.set_number = ?
        AND wl.workout_date = ?
        AND we.exercise_order < ?
      ORDER BY we.exercise_order DESC
      LIMIT 1
    `;

  // If no same day result, check previous days (use highest exercise_order from previous days)
  const previousDayQuery = `
      SELECT
        ws.set_number as setNumber,
        ws.reps_left as leftReps,
        ws.reps_right as rightReps,
        ws.weight,
        ws.weight_unit as weightUnit,
        we.exercise_order,
        'previous_day' as source
      FROM workout_logs wl
      JOIN workout_exercises we ON wl.workout_log_id = we.workout_log_id
      JOIN workout_sets ws ON we.workout_exercise_id = ws.workout_exercise_id
      WHERE wl.user_id = ? 
        AND wl.program_id = ? 
        AND wl.day_id = ? 
        AND we.program_exercise_id = ?
        AND ws.set_number = ?
        AND wl.workout_date < ?
      ORDER BY wl.workout_date DESC, we.exercise_order DESC
      LIMIT 1
    `;

  if (connection) {
    // First try same day
    const [sameDayResult] = await connection.execute(sameDayQuery, [
      userId,
      programId,
      dayId,
      programExerciseId,
      setNumber,
      currentWorkoutDate,
      currentExerciseOrder,
    ]);

    if ((sameDayResult as any[]).length > 0) {
      return sameDayResult as any[];
    }

    // If no same day result, try previous days
    const [previousDayResult] = await connection.execute(previousDayQuery, [
      userId,
      programId,
      dayId,
      programExerciseId,
      setNumber,
      currentWorkoutDate,
    ]);
    return previousDayResult as any[];
  } else {
    // First try same day
    const [sameDayResult] = await pool.execute(sameDayQuery, [
      userId,
      programId,
      dayId,
      programExerciseId,
      setNumber,
      currentWorkoutDate,
      currentExerciseOrder,
    ]);

    if ((sameDayResult as any[]).length > 0) {
      return sameDayResult as any[];
    }

    // If no same day result, try previous days
    const [previousDayResult] = await pool.execute(previousDayQuery, [
      userId,
      programId,
      dayId,
      programExerciseId,
      setNumber,
      currentWorkoutDate,
    ]);
    return previousDayResult as any[];
  }
};

const GetExercisesByDayId = async (
  dayId: string,
  connection?: any
): Promise<any> => {
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
};

const GetPreviousExerciseNotes = async (
  userId: string,
  programId: string,
  dayId: string,
  exerciseName: string,
  currentWorkoutDate: string,
  connection?: any
): Promise<any> => {
  // Get notes from previous workout days only
  const query = `
      SELECT
        we.notes,
        we.exercise_order,
        'previous_day' as source
      FROM workout_logs wl
      JOIN workout_exercises we ON wl.workout_log_id = we.workout_log_id
      WHERE wl.user_id = ? 
        AND wl.program_id = ? 
        AND wl.day_id = ? 
        AND we.exercise_name = ?
        AND wl.workout_date < ?
      ORDER BY wl.workout_date DESC, we.exercise_order DESC
      LIMIT 1
    `;

  if (connection) {
    const [result] = await connection.execute(query, [
      userId,
      programId,
      dayId,
      exerciseName,
      currentWorkoutDate,
    ]);
    return result as any[];
  } else {
    const [result] = await pool.execute(query, [
      userId,
      programId,
      dayId,
      exerciseName,
      currentWorkoutDate,
    ]);
    return result as any[];
  }
};

const AddWorkoutSet = async (
  workoutSetId: string,
  workoutExerciseId: string,
  setNumber: number,
  repsLeft: number,
  repsRight: number,
  weight: number,
  weightUnit: string
): Promise<any> => {
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
};

const CreateManualWorkoutLog = async (
  workoutLogId: string,
  userId: string,
  programId: string,
  dayId: string,
  title: string,
  workoutDate: string,
  status: string,
  expectedNumberOfSets: number,
  connection?: any
): Promise<any> => {
  const query =
    "INSERT INTO workout_logs (workout_log_id, user_id, program_id, day_id, title, workout_date, status, timer, expected_number_of_sets ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

  if (connection) {
    const [result] = await connection.execute(query, [
      workoutLogId,
      userId,
      programId,
      dayId,
      title,
      workoutDate,
      status,
      0,
      expectedNumberOfSets,
    ]);
    return result as any[];
  } else {
    const [result] = await pool.execute(query, [
      userId,
      programId,
      dayId,
      title,
      workoutDate,
      status,
      0,
      expectedNumberOfSets,
    ]);
    return result as any[];
  }
};

const AddManualWorkoutExercise = async (
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
};

const DeleteWorkoutSet = async (workoutSetId: string): Promise<any> => {
  const query = "DELETE FROM workout_sets WHERE workout_set_id = ?";
  const [result] = await pool.execute(query, [workoutSetId]);
  return result as any[];
};

const UpdateExpectedNumberOfSets = async (
  workoutLogId: string,
  expectedNumberOfSets: number
): Promise<any> => {
  const query =
    "UPDATE workout_logs SET expected_number_of_sets = ? WHERE workout_log_id = ?";
  const [result] = await pool.execute(query, [
    expectedNumberOfSets,
    workoutLogId,
  ]);
  return result as any[];
};

const UpdateTimer = async (
  workoutLogId: string,
  time: bigint
): Promise<any> => {
  const query = "UPDATE workout_logs SET timer = ? WHERE workout_log_id = ?";
  const [result] = await pool.execute(query, [time, workoutLogId]);
  return result as any[];
};

export default {
  IsWorkoutLogExists,
  IsWorkoutExerciseExists,
  GetWorkoutLogsByDateRange,
  UpdateExerciseNotes,
  GetWorkoutLogDates,
  UpdateExpectedNumberOfSets,
  UpdateWorkoutSet,
  UpdateWorkoutLogStatus,
  UpdateWorkoutLogName,
  GetPreviousWorkoutLogForExercise,
  GetPreviousWorkoutLogForExerciseByName,
  GetPreviousExerciseNotes,
  GetCompletedWorkoutLogs,
  GetExercisesByDayId,
  GetWorkoutExercisesAndSets,
  GetWorkoutLogPagination,
  CreateManualWorkoutLog,
  AddManualWorkoutExercise,
  AddWorkoutSet,
  DeleteWorkoutSet,
  UpdateTimer,
};
