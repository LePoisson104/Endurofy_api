import { v4 as uuidv4 } from "uuid";
import {
  ExerciseRequest,
  WorkoutProgramRequest,
} from "../interfaces/workout-program.interface";
import pool from "../../../config/db.config";
import Logger from "../utils/logger";
import WorkoutPrograms from "../repositories/workout-program.repositories";
import {
  WorkoutDayRepo,
  ExerciseRepo,
} from "../interfaces/workout-program.interface";
import { AppError } from "../middlewares/error.handlers";

const getAllWorkoutPrograms = async (
  userId: string
): Promise<{ data: { programs: WorkoutProgramRequest[] } }> => {
  const workoutPrograms = await WorkoutPrograms.queryGetWorkoutProgram(userId);

  if (!workoutPrograms || workoutPrograms.length === 0) {
    return {
      data: {
        programs: [],
      },
    };
  }

  const allPrograms = await Promise.all(
    workoutPrograms.map(
      async (program: {
        program_id: string;
        program_name: string;
        description: string;
        program_type: string;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      }) => {
        const workoutDays = await WorkoutPrograms.queryGetWorkoutProgramDays(
          program.program_id
        );

        const workoutExercisesMap: { [key: string]: ExerciseRepo[] } = {};
        for (const day of workoutDays) {
          const exercises = await WorkoutPrograms.queryGetProgramDaysExercises(
            day.program_day_id
          );
          workoutExercisesMap[day.program_day_id] = exercises;
        }

        return {
          programId: program.program_id,
          programName: program.program_name,
          description: program.description,
          programType: program.program_type,
          isActive: program.is_active,
          createdAt: program.created_at,
          updatedAt: program.updated_at,
          workoutDays: workoutDays
            .sort(
              (a: WorkoutDayRepo, b: WorkoutDayRepo) =>
                a.day_number - b.day_number
            )
            .map((day: WorkoutDayRepo) => {
              const dayExercises = Array.isArray(
                workoutExercisesMap[day.program_day_id]
              )
                ? workoutExercisesMap[day.program_day_id]
                : [];

              return {
                dayId: day.program_day_id,
                dayNumber: day.day_number,
                dayName: day.day_name,
                exercises: dayExercises.map((exercise: ExerciseRepo) => ({
                  exerciseId: exercise.program_exercise_id,
                  exerciseName: exercise.exercise_name,
                  bodyPart: exercise.body_part,
                  laterality: exercise.laterality,
                  sets: exercise.sets,
                  minReps: exercise.min_reps,
                  maxReps: exercise.max_reps,
                  exerciseOrder: exercise.exercise_order,
                })),
              };
            }),
        };
      }
    )
  );

  return {
    data: {
      programs: allPrograms,
    },
  };
};

const createWorkoutProgram = async (
  userId: string,
  workoutProgram: WorkoutProgramRequest
): Promise<{ data: { message: string } }> => {
  const connection = await pool.getConnection();

  try {
    const workoutProgramId = uuidv4();
    await connection.execute(
      "INSERT INTO programs (program_id, user_id, program_name, description, program_type) VALUES (?, ?, ?, ?, ?)",
      [
        workoutProgramId,
        userId,
        workoutProgram.programName,
        workoutProgram.description,
        workoutProgram.programType,
      ]
    );

    for (const day of workoutProgram.workoutDays) {
      const dayId = uuidv4();
      await connection.execute(
        "INSERT INTO program_days (program_day_id, program_id, day_name, day_number) VALUES (?, ?, ?, ?)",
        [dayId, workoutProgramId, day.dayName, day.dayNumber]
      );
      for (const exercise of day.exercises) {
        const exerciseId = uuidv4();
        await connection.execute(
          "INSERT INTO program_exercises (program_exercise_id, program_day_id, exercise_name, body_part, laterality, sets, min_reps, max_reps, exercise_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            exerciseId,
            dayId,
            exercise.exerciseName,
            exercise.bodyPart,
            exercise.laterality,
            exercise.sets,
            exercise.minReps,
            exercise.maxReps,
            exercise.exerciseOrder,
          ]
        );
      }
    }
  } catch (err) {
    await connection.rollback();
    await Logger.logEvents(
      `Error creating workout program: ${err}`,
      "errLog.log"
    );
  } finally {
    connection.release();
  }

  return {
    data: {
      message: "Workout program created successfully",
    },
  };
};

const addExercise = async (
  programId: string,
  dayId: string,
  exercise: ExerciseRequest
): Promise<{ data: { message: string } }> => {
  const isProgramAndProgramDayExists =
    await WorkoutPrograms.queryIfProgramAndProgramDayExists(programId, dayId);

  if (!isProgramAndProgramDayExists) {
    throw new AppError("Program or program day not found", 404);
  }

  const exerciseId = uuidv4();
  await WorkoutPrograms.queryAddExercise(dayId, exerciseId, exercise);

  await WorkoutPrograms.queryUpdateWorkoutProgramUpdatedAt(programId);

  return {
    data: {
      message: "Exercise added successfully",
    },
  };
};

const addProgramDay = async (
  programId: string,
  payload: { dayName: string; dayNumber: number }
): Promise<{ data: { message: string } }> => {
  const { dayName, dayNumber } = payload;
  const dayId = uuidv4();

  await WorkoutPrograms.queryAddProgramDay(
    programId,
    dayId,
    dayName,
    dayNumber
  );
  await WorkoutPrograms.queryUpdateWorkoutProgramUpdatedAt(programId);

  return {
    data: {
      message: "Program day added successfully",
    },
  };
};

const updateWorkoutProgramDescription = async (
  userId: string,
  programId: string,
  payload: { programName: string; description: string }
): Promise<{ data: { message: string } }> => {
  const { programName, description } = payload;
  const result = await WorkoutPrograms.queryUpdateWorkoutProgramDescription(
    userId,
    programId,
    programName,
    description
  );

  if (result.affectedRows === 0) {
    throw new AppError("Program not found", 404);
  }

  await WorkoutPrograms.queryUpdateWorkoutProgramUpdatedAt(programId);

  return {
    data: {
      message: "Workout program description updated successfully",
    },
  };
};

const updateWorkoutProgramDay = async (
  programId: string,
  dayId: string,
  payload: { dayName: string }
): Promise<{ data: { message: string } }> => {
  const { dayName } = payload;
  const result = await WorkoutPrograms.queryUpdateWorkoutProgramDay(
    programId,
    dayId,
    dayName
  );

  if (result.affectedRows === 0) {
    throw new AppError("Program day not found", 404);
  }

  await WorkoutPrograms.queryUpdateWorkoutProgramUpdatedAt(programId);

  return {
    data: {
      message: "Workout program day updated successfully",
    },
  };
};

const updateWorkoutProgramExercise = async (
  dayId: string,
  exerciseId: string,
  programId: string,
  payload: {
    exerciseName: string;
    bodyPart: string;
    laterality: string;
    sets: number;
    minReps: number;
    maxReps: number;
    exerciseOrder: number;
  }
): Promise<{ data: { message: string } }> => {
  const {
    exerciseName,
    bodyPart,
    laterality,
    sets,
    minReps,
    maxReps,
    exerciseOrder,
  } = payload;
  const result = await WorkoutPrograms.queryUpdateWorkoutProgramExercise(
    dayId,
    exerciseId,
    exerciseName,
    bodyPart,
    laterality,
    sets,
    minReps,
    maxReps,
    exerciseOrder
  );

  if (result.affectedRows === 0) {
    throw new AppError("Exercise not found", 404);
  }

  await WorkoutPrograms.queryUpdateWorkoutProgramUpdatedAt(programId);

  return {
    data: {
      message: "Workout program description updated successfully",
    },
  };
};

const reorderExerciseOrder = async (
  programId: string,
  dayId: string,
  payload: ExerciseRequest[]
): Promise<{ data: { message: string } }> => {
  for (const exercise of payload) {
    await WorkoutPrograms.queryReorderExerciseOrder(
      dayId,
      exercise.exerciseId,
      exercise.exerciseOrder
    );
  }

  await WorkoutPrograms.queryUpdateWorkoutProgramUpdatedAt(programId);

  return {
    data: { message: "Exercise order updated successfully" },
  };
};

const setProgramAsActive = async (
  userId: string,
  programId: string
): Promise<{ data: { message: string } }> => {
  const result = await WorkoutPrograms.querySetAllAsInactive(userId);

  if (result.affectedRows === 0) {
    throw new AppError("User not found", 404);
  }

  const result2 = await WorkoutPrograms.querySetProgramAsActive(
    userId,
    programId
  );

  if (result2.affectedRows === 0) {
    throw new AppError("Program not found", 404);
  }

  return {
    data: {
      message: "Program set as active successfully",
    },
  };
};

const setProgramAsInactive = async (
  userId: string,
  programId: string
): Promise<{ data: { message: string } }> => {
  const result = await WorkoutPrograms.querySetProgramAsInactive(
    userId,
    programId
  );

  if (result.affectedRows === 0) {
    throw new AppError("Program not found", 404);
  }

  return {
    data: {
      message: "Program set as inactive successfully",
    },
  };
};

const deleteWorkoutProgram = async (
  userId: string,
  programId: string
): Promise<{ data: { message: string } }> => {
  const result = await WorkoutPrograms.queryDeleteWorkoutProgram(
    userId,
    programId
  );

  if (result.affectedRows === 0) {
    throw new AppError("Program not found", 404);
  }
  return {
    data: {
      message: "Workout program deleted successfully",
    },
  };
};

const deleteWorkoutProgramDay = async (
  programId: string,
  dayId: string
): Promise<{ data: { message: string } }> => {
  const result = await WorkoutPrograms.queryDeleteWorkoutProgramDay(
    programId,
    dayId
  );

  if (result.affectedRows === 0) {
    throw new AppError("Program day not found", 404);
  }

  await WorkoutPrograms.queryUpdateWorkoutProgramUpdatedAt(programId);

  return {
    data: {
      message: "Workout program day deleted successfully",
    },
  };
};

const deleteWorkoutProgramExercise = async (
  programId: string,
  dayId: string,
  exerciseId: string
): Promise<{ data: { message: string } }> => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // First get the exercise_order of the exercise being deleted
    const [deletedExercise] = await connection.execute(
      "SELECT exercise_order FROM program_exercises WHERE program_exercise_id = ? AND program_day_id = ?",
      [exerciseId, dayId]
    );

    if ((deletedExercise as any[]).length === 0) {
      throw new AppError("Exercise not found", 404);
    }

    const deletedOrder = (deletedExercise as any[])[0].exercise_order;

    // Delete the exercise
    await connection.execute(
      "DELETE FROM program_exercises WHERE program_exercise_id = ? AND program_day_id = ?",
      [exerciseId, dayId]
    );

    // Update the order of all exercises that come after the deleted one
    await connection.execute(
      "UPDATE program_exercises SET exercise_order = exercise_order - 1 WHERE program_day_id = ? AND exercise_order > ?",
      [dayId, deletedOrder]
    );

    await WorkoutPrograms.queryUpdateWorkoutProgramUpdatedAt(programId);

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    await Logger.logEvents(
      `Error deleting workout program exercise: ${err}`,
      "errLog.log"
    );
    throw err;
  } finally {
    connection.release();
  }
  return {
    data: {
      message: "Exercise deleted successfully",
    },
  };
};

export default {
  createWorkoutProgram,
  getAllWorkoutPrograms,
  deleteWorkoutProgram,
  updateWorkoutProgramDescription,
  updateWorkoutProgramDay,
  updateWorkoutProgramExercise,
  addExercise,
  deleteWorkoutProgramDay,
  deleteWorkoutProgramExercise,
  reorderExerciseOrder,
  addProgramDay,
  setProgramAsActive,
  setProgramAsInactive,
};
