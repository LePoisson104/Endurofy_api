import { v4 as uuidv4 } from "uuid";
import { WorkoutProgramRequest } from "../interfaces/workout-program.interface";
import pool from "../../../config/db.config";
import Logger from "../utils/logger";
import WorkoutPrograms from "../repositories/workout-program.repositories";
import {
  WorkoutDayRepo,
  ExerciseRepo,
  WorkoutProgramRepo,
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
      "INSERT INTO programs (program_id, user_id, program_name, description) VALUES (?, ?, ?, ?)",
      [
        workoutProgramId,
        userId,
        workoutProgram.programName,
        workoutProgram.description,
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
  const result = await WorkoutPrograms.queryDeleteWorkoutProgramExercise(
    dayId,
    exerciseId
  );

  if (result.affectedRows === 0) {
    throw new AppError("Exercise not found", 404);
  }

  await WorkoutPrograms.queryUpdateWorkoutProgramUpdatedAt(programId);

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
  deleteWorkoutProgramDay,
  deleteWorkoutProgramExercise,
};
