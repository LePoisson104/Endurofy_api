export interface WorkoutProgramRequest {
  programName: string;
  description?: string;
  workoutDays: WorkoutDay[];
}

export interface WorkoutDay {
  dayNumber: number;
  dayName: string;
  exercises: Exercise[];
}

export interface Exercise {
  exerciseName: string;
  bodyPart: string;
  laterality: "bilateral" | "unilateral";
  sets: number;
  minReps: number;
  maxReps: number;
  exerciseOrder: number;
}

export interface WorkoutProgramRepo {
  program_id: string;
  user_id: string;
  program_name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
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
  laterality: "bilateral" | "unilateral";
  sets: number;
  min_reps: number;
  max_reps: number;
  exercise_order: number;
}

export interface ExerciseRequest {
  dayId: string;
  exerciseName: string;
  bodyPart: string;
  laterality: "bilateral" | "unilateral";
  sets: number;
  minReps: number;
  maxReps: number;
  exerciseOrder: number;
}
