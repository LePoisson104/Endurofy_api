import { v4 as uuidv4 } from "uuid";
import { WorkoutProgramRequest } from "../interfaces/workout-program.interface";
import pool from "../../../config/db.config";
import Logger from "../utils/logger";
import WorkoutPrograms from "../repositories/workout-program.repositories";
import {
  WorkoutDayRepo,
  ExerciseRepo,
} from "../interfaces/workout-program.interface";

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

const deleteWorkoutProgram = async (
  userId: string,
  programId: string
): Promise<{ data: { message: string } }> => {
  await WorkoutPrograms.queryDeleteWorkoutProgram(userId, programId);
  return {
    data: {
      message: "Workout program deleted successfully",
    },
  };
};

export default {
  createWorkoutProgram,
  getAllWorkoutPrograms,
  deleteWorkoutProgram,
};
