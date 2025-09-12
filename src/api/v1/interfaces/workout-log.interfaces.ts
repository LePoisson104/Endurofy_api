export interface WorkoutRequestPayload {
  workoutName: string;
  workoutDate: string;
  exerciseNotes: string;
  exerciseName: string;
  bodyPart: string;
  laterality: string;
  setNumber: number;
  repsLeft: number;
  repsRight: number;
  weight: number;
  weightUnit: string;
  programExerciseId: string;
  exerciseOrder: number;
}

export interface WorkoutLogData {
  workoutLogId: string;
  userId: string;
  programId: string;
  dayId: string;
  title: string;
  workoutDate: Date;
  status: string;
  workoutExercises: WorkoutExerciseData[];
}

export interface WorkoutExerciseData {
  workoutExerciseId: string;
  workoutLogId: string;
  programExerciseId: string;
  exerciseName: string;
  bodyPart: string;
  laterality: string;
  exerciseOrder: number;
  notes: string;
  workoutSets: WorkoutSetData[];
}

export interface WorkoutSetData {
  workoutSetId: string;
  workoutExerciseId: string;
  setNumber: number;
  repsLeft: number;
  repsRight: number;
  weight: number;
  weightUnit: string;
  previousLeftReps: number | null;
  previousRightReps: number | null;
  previousWeight: number | null;
  previousWeightUnit: string | null;
}

export interface previousWorkoutLog {
  previousLeftReps: number;
  previousRightReps: number;
  previousWeight: number;
  previousWeightUnit: string;
}

export interface PreviousWorkoutLogData {
  programExerciseId: string;
  exerciseName: string;
  bodyPart: string;
  laterality: string;
  sets: number;
  minReps: number;
  maxReps: number;
  exerciseOrder: number;
  previousWorkoutSets: {
    setNumber: number;
    leftReps: number | null;
    rightReps: number | null;
    weight: number | null;
    weightUnit: string | null;
  }[];
}

export interface WorkoutLogExists {
  workout_log_id: string;
  user_id: string;
  program_id: string;
  day_id: string;
  title: string;
  workout_date: Date;
  status: "completed" | "incomplete";
}

export interface WorkoutLogPagination {
  offset: number;
  limit: number;
  nextOffset: number;
  hasMore: boolean;
  workoutLogsData: WorkoutLogData[];
}

export interface WeeklyBodyPartSets {
  bodyPart: string;
  totalSets: number;
}
