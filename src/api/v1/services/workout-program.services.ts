import { v4 as uuidv4 } from "uuid";
import { WorkoutProgramRequest } from "../interfaces/workout-program.interface";
import pool from "../../../config/db.config";
import Logger from "../utils/logger";
import WorkoutPrograms from "../repositories/workout-program.repositories";
import { WorkoutDay } from "../interfaces/workout-program.interface";
const getWorkoutProgram = async (
  userId: string
): Promise<{ data: { programs: WorkoutProgramRequest[] } }> => {
  const workoutProgram = await WorkoutPrograms.queryGetWorkoutProgram(userId);
  const workoutDays = await WorkoutPrograms.queryGetWorkoutProgramDays(
    workoutProgram[0].program_id
  );
  const workoutExercises = [];
  for (const day of workoutDays) {
    const exercises = await WorkoutPrograms.queryGetProgramDaysExercises(
      day.program_day_id
    );
    workoutExercises.push(exercises);
  }

  //   const constructWorkoutProgram = {
  //     programName: workoutProgram[0].program_name,
  //     description: workoutProgram[0].description,
  //     workoutDays: workoutDays.map((day: WorkoutDay) => ({
  //       day: day.day_number,
  //       dayName: day.day_name,
  //       exercises: workoutExercises,
  //     })),
  //   };

  return {
    data: {
      programs: [],
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
        [dayId, workoutProgramId, day.dayName, day.day]
      );
      for (const exercise of day.exercises) {
        const exerciseId = uuidv4();
        await connection.execute(
          "INSERT INTO program_exercises (program_exercise_id, program_day_id, exercise_name, body_part, action, sets, min_reps, max_reps) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [
            exerciseId,
            dayId,
            exercise.exerciseName,
            exercise.bodyPart,
            exercise.action,
            exercise.sets,
            exercise.minReps,
            exercise.maxReps,
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

export default {
  createWorkoutProgram,
  getWorkoutProgram,
};
