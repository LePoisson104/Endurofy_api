export interface WorkoutStats {
  weightIncrease: number;
  weightUnit: string;
  totalVolume: number;
  totalSets: number;
}

export interface WeightProgression {
  date: string;
  weight: number;
}

export interface VolumeProgression {
  date: string;
  volume: number;
}

export interface WorkoutSets {
  setNumber: number;
  repsLeft: number;
  repsRight: number;
  reps: number;
  weight: number;
  weightUnit: string;
}

export interface SessionHistory {
  date: string;
  title: string;
  exerciseName: string;
  sets: WorkoutSets[];
}

export interface WorkoutProgressionData {
  stats: WorkoutStats;
  weightProgression: WeightProgression[];
  volumeProgression: VolumeProgression[];
  sessionHistory: SessionHistory[];
}
