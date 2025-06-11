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
  repsLeft: number;
  repsRight: number;
  weight: number;
  weightUnit: string;
}
