export interface WorkoutProgramRequest {
  programName: string;
  description?: string;
  workoutDays: WorkoutDay[];
}

export interface WorkoutDay {
  day: number;
  dayName: string;
  exercises: Exercise[];
}

export interface Exercise {
  exerciseName: string;
  bodyPart: string;
  action: "bilateral" | "unilateral";
  sets: number;
  minReps: number;
  maxReps: number;
}

export interface WorkoutDayRepo {
  program_day_id: string;
  program_id: string;
  day_number: number;
  day_name: string;
  exercises: ExerciseRepo[];
}

export interface ExerciseRepo {
  program_exercise_id: string;
  program_day_id: string;
  exercise_name: string;
  body_part: string;
  action: "bilateral" | "unilateral";
  sets: number;
  min_reps: number;
  max_reps: number;
}
