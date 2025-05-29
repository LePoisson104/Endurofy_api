export interface WorkoutRequestPayload {
  title: string;
  workoutDate: Date;
  notes: string;
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
