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
