import { AppError } from "../middlewares/error.handlers";
import { v4 as uuidv4 } from "uuid";
import {
  WorkoutLogData,
  WorkoutRequestPayload,
  PreviousWorkoutLogData,
  WorkoutLogExists,
  WorkoutLogPagination,
} from "../interfaces/workout-log.interfaces";
import pool from "../../../config/db.config";
import Logger from "../utils/logger";
import workoutLogRepository from "../repositories/workout-log.repositories";

const getManualWorkoutLogWithPrevious = async (
  userId: string,
  programId: string,
  workoutDate: string
): Promise<{ data: WorkoutLogData[] }> => {
  const connection = await pool.getConnection();

  try {
    // Get the workout log for the specified date
    const workoutLogResult = await workoutLogRepository.queryIsWorkoutLogExists(
      userId,
      programId,
      workoutDate,
      connection
    );

    if (workoutLogResult.length === 0) {
      return { data: [] };
    }

    const workoutLog = workoutLogResult[0];

    // Get all exercises for this workout log
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

    // Process each exercise to get current sets and previous values
    const workoutExercisesData = await Promise.all(
      (workoutExercisesResult as any[]).map(async (exercise) => {
        // Get current workout sets for this exercise
        const [currentSetsResult] = (await connection.execute(
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

        // If there are current sets, get previous values for each set
        let workoutSetsWithPrevious: any[] = [];

        if (currentSetsResult.length > 0) {
          // Exercise has current sets - get previous values for each
          workoutSetsWithPrevious = await Promise.all(
            (currentSetsResult as any[]).map(async (set) => {
              const previousWorkoutLogResult =
                await workoutLogRepository.queryPreviousWorkoutLogForExercise(
                  userId,
                  programId,
                  workoutLog.day_id,
                  exercise.program_exercise_id,
                  set.set_number,
                  workoutDate,
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
        } else {
          // Exercise has no current sets - still get previous values to show what was done before
          // We'll look for previous sets for this exercise and create placeholder current sets
          const previousWorkoutResult = await connection.execute(
            `SELECT DISTINCT ws.set_number
             FROM workout_logs wl
             JOIN workout_exercises we ON wl.workout_log_id = we.workout_log_id
             JOIN workout_sets ws ON we.workout_exercise_id = ws.workout_exercise_id
             WHERE wl.user_id = ? 
               AND wl.program_id = ? 
               AND wl.day_id = ? 
               AND we.program_exercise_id = ?
               AND wl.workout_date < ?
             ORDER BY ws.set_number`,
            [
              userId,
              programId,
              workoutLog.day_id,
              exercise.program_exercise_id,
              workoutDate,
            ]
          );

          const [previousSets] = previousWorkoutResult as any[];

          if (previousSets.length > 0) {
            // Create placeholder sets with previous values
            workoutSetsWithPrevious = await Promise.all(
              (previousSets as any[]).map(async (prevSet) => {
                const previousWorkoutLogResult =
                  await workoutLogRepository.queryPreviousWorkoutLogForExercise(
                    userId,
                    programId,
                    workoutLog.day_id,
                    exercise.program_exercise_id,
                    prevSet.set_number,
                    workoutDate,
                    connection
                  );

                return {
                  workoutSetId: null, // No current set exists
                  workoutExerciseId: exercise.workout_exercise_id,
                  setNumber: prevSet.set_number,
                  repsLeft: null, // No current values
                  repsRight: null,
                  weight: null,
                  weightUnit: null,
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
          }
        }

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

    // Construct the complete workout log data
    const workoutLogData = {
      workoutLogId: workoutLog.workout_log_id,
      userId: workoutLog.user_id,
      programId: workoutLog.program_id,
      dayId: workoutLog.day_id,
      title: workoutLog.title,
      workoutDate: new Date(workoutLog.workout_date),
      status: workoutLog.status,
      workoutExercises: workoutExercisesData,
    };

    return { data: [workoutLogData] };
  } catch (err: any) {
    Logger.logEvents(
      `Error getting manual workout log with previous: ${err}`,
      "errLog.log"
    );
    if (err instanceof AppError) throw err;
    throw new AppError("Error getting manual workout log with previous", 500);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const getWorkoutLogPagination = async (
  userId: string,
  programId: string,
  limit: number,
  offset: number
): Promise<{ data: WorkoutLogPagination }> => {
  const connection = await pool.getConnection();

  try {
    const workoutLogs: WorkoutLogExists[] =
      await workoutLogRepository.queryGetWorkoutLogPagination(
        programId,
        limit + 1,
        offset,
        connection
      );

    const workoutLogsData =
      await workoutLogRepository.queryGetWorkoutExercisesAndSets(
        userId,
        programId,
        [...workoutLogs].slice(0, limit),
        connection
      );

    return {
      data: {
        offset: offset,
        limit: limit,
        nextOffset: offset + limit,
        hasMore: workoutLogs.length === limit + 1,
        workoutLogsData: workoutLogsData,
      },
    };
  } catch (err) {
    Logger.logEvents(
      `Error getting workout log pagination: ${err}`,
      "errLog.log"
    );
    throw new AppError("Error getting workout log pagination", 500);
  } finally {
    connection.release();
  }
};

const getWorkoutLogData = async (
  userId: string,
  programId: string,
  startDate: string,
  endDate: string
): Promise<{ data: WorkoutLogData[] }> => {
  const connection = await pool.getConnection();

  try {
    let workoutLogResults: WorkoutLogExists[];

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
    const workoutLogsData =
      await workoutLogRepository.queryGetWorkoutExercisesAndSets(
        userId,
        programId,
        workoutLogResults,
        connection
      );

    return { data: workoutLogsData };
  } catch (err) {
    Logger.logEvents(`Error getting workout log data: ${err}`, "errLog.log");
    throw new AppError("Error getting workout log data", 500);
  } finally {
    connection.release();
  }
};

const getPreviousWorkoutLog = async (
  userId: string,
  programId: string,
  dayId: string,
  currentWorkoutDate: string
): Promise<{ data: PreviousWorkoutLogData[] }> => {
  const connection = await pool.getConnection();

  try {
    // Get all exercises for this dayId
    const exercises = await workoutLogRepository.queryGetExercisesByDayId(
      dayId,
      connection
    );

    if (exercises.length === 0) {
      return { data: [] };
    }

    // Loop through each exercise and find previous workout data
    const exercisesWithPreviousData: PreviousWorkoutLogData[] =
      await Promise.all(
        exercises.map(
          async (exercise: any): Promise<PreviousWorkoutLogData> => {
            // Get previous workout data for each set of this exercise
            const previousWorkoutSets = [];

            for (let setNumber = 1; setNumber <= exercise.sets; setNumber++) {
              const previousWorkoutLogResult =
                await workoutLogRepository.queryPreviousWorkoutLogForExercise(
                  userId,
                  programId,
                  dayId,
                  exercise.program_exercise_id,
                  setNumber,
                  currentWorkoutDate,
                  connection
                );

              // Add the previous data for this set
              if (previousWorkoutLogResult.length > 0) {
                const previousSet = previousWorkoutLogResult[0];
                previousWorkoutSets.push({
                  setNumber: previousSet.setNumber,
                  leftReps: previousSet.leftReps,
                  rightReps: previousSet.rightReps,
                  weight: parseFloat(previousSet.weight),
                  weightUnit: previousSet.weightUnit,
                });
              } else {
                // No previous data for this set
                previousWorkoutSets.push({
                  setNumber: setNumber,
                  leftReps: null,
                  rightReps: null,
                  weight: null,
                  weightUnit: null,
                });
              }
            }

            return {
              programExerciseId: exercise.program_exercise_id,
              exerciseName: exercise.exercise_name,
              bodyPart: exercise.body_part,
              laterality: exercise.laterality,
              sets: exercise.sets,
              minReps: exercise.min_reps,
              maxReps: exercise.max_reps,
              exerciseOrder: exercise.exercise_order,
              previousWorkoutSets: previousWorkoutSets,
            };
          }
        )
      );

    return { data: exercisesWithPreviousData };
  } catch (err) {
    Logger.logEvents(
      `Error getting previous workout log: ${err}`,
      "errLog.log"
    );
    throw new AppError("Error getting previous workout log", 500);
  } finally {
    connection.release();
  }
};

const getCompletedWorkoutLogs = async (
  userId: string,
  programId: string,
  startDate: string,
  endDate: string
): Promise<{ data: number }> => {
  const completedWorkoutLogs =
    await workoutLogRepository.queryGetCompletedWorkoutLogs(
      userId,
      programId,
      new Date(startDate),
      new Date(endDate)
    );

  return { data: completedWorkoutLogs };
};

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

const createWorkoutLog = async (
  userId: string,
  programId: string,
  dayId: string,
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
        "INSERT INTO workout_logs (workout_log_id, user_id, program_id, day_id, title, workout_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          currentWorkoutLogId,
          userId,
          programId,
          dayId,
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

const createManualWorkoutLog = async (
  userId: string,
  programId: string,
  dayId: string,
  workoutLogPayload: { title: string; workoutDate: string }
): Promise<{ data: { message: string } }> => {
  const { title, workoutDate } = workoutLogPayload;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const isWorkoutLogExists =
      await workoutLogRepository.queryIsWorkoutLogExists(
        userId,
        programId,
        workoutDate,
        connection
      );

    if (isWorkoutLogExists.length !== 0) {
      throw new AppError("Workout log already exists", 400);
    }

    const workoutLogResult =
      await workoutLogRepository.queryCreateManualWorkoutLog(
        uuidv4(),
        userId,
        programId,
        dayId,
        title,
        workoutDate,
        "incomplete",
        connection
      );

    if (workoutLogResult.length === 0) {
      throw new AppError("Failed to create workout log", 500);
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    Logger.logEvents(`Error creating manual workout log: ${err}`, "errLog.log");
    if (err instanceof AppError) throw err;
    throw new AppError("Database error while creating manual workout log", 500);
  } finally {
    if (connection) {
      connection.release();
    }
  }

  return {
    data: {
      message: "Workout log created successfully",
    },
  };
};

const addWorkoutSet = async (
  workoutExerciseId: string,
  workoutSetPayload: {
    setNumber: number;
    repsLeft: number;
    repsRight: number;
    weight: number;
    weightUnit: string;
  }
): Promise<{ data: { message: string } }> => {
  const { setNumber, repsLeft, repsRight, weight, weightUnit } =
    workoutSetPayload;

  const workoutSetId = uuidv4();

  const result = await workoutLogRepository.queryAddWorkoutSet(
    workoutSetId,
    workoutExerciseId,
    setNumber,
    repsLeft,
    repsRight,
    weight,
    weightUnit
  );

  if (result.length === 0) {
    throw new AppError("Failed to add workout set", 500);
  }

  return {
    data: {
      message: "Workout set added successfully",
    },
  };
};

const addManualWorkoutExercise = async (
  workoutLogId: string,
  programExerciseId: string,
  workoutLogPayload: {
    exerciseName: string;
    bodyPart: string;
    laterality: string;
    exerciseOrder: number;
  }
): Promise<{ data: { message: string } }> => {
  const workoutExerciseId = uuidv4();

  const result = await workoutLogRepository.queryAddManualWorkoutExercise(
    workoutExerciseId,
    workoutLogId,
    programExerciseId,
    workoutLogPayload
  );

  if (result.length === 0) {
    throw new AppError("Failed to add workout exercise", 500);
  }

  return {
    data: {
      message: "Workout exercise added successfully",
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

const updateWorkoutLogName = async (
  workoutLogId: string,
  title: string
): Promise<{ data: { message: string } }> => {
  const result = await workoutLogRepository.queryUpdateWorkoutLogName(
    workoutLogId,
    title
  );

  if (result.affectedRows === 0) {
    throw new AppError("Invalid workout log id", 400);
  }

  return {
    data: {
      message: "Workout log name updated successfully",
    },
  };
};

const deleteWorkoutLog = async (
  workoutLogId: string
): Promise<{ data: { message: string } }> => {
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

  return {
    data: {
      message: "Workout log deleted successfully",
    },
  };
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

const deleteWorkoutSet = async (
  workoutSetId: string
): Promise<{ data: { message: string } }> => {
  const result = await workoutLogRepository.queryDeleteWorkoutSet(workoutSetId);

  if (result.affectedRows === 0) {
    throw new AppError("Invalid workout set id", 400);
  }

  return {
    data: {
      message: "Workout set deleted successfully",
    },
  };
};

const deleteWorkoutExercise = async (
  workoutExerciseId: string
): Promise<{ data: { message: string } }> => {
  const result = await workoutLogRepository.queryDeleteWorkoutExercise(
    workoutExerciseId
  );

  if (result.affectedRows === 0) {
    throw new AppError("Invalid workout exercise id", 400);
  }

  return {
    data: {
      message: "Workout exercise deleted successfully",
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
  getWorkoutLogPagination,
  getManualWorkoutLogWithPrevious,
  addWorkoutSet,
  createWorkoutLog,
  createManualWorkoutLog,
  addManualWorkoutExercise,
  updateWorkoutLogStatus,
  updateWorkoutLogName,
  deleteWorkoutLog,
  updateWorkoutSet,
  deleteWorkoutSetWithCascade,
  getWorkoutLogData,
  updateExerciseNotes,
  getWorkoutLogDates,
  getCompletedWorkoutLogs,
  deleteWorkoutSet,
  getPreviousWorkoutLog,
  deleteWorkoutExercise,
};
