export interface WeightLogPayload {
  weight: number;
  weightUnit: string;
  caloriesIntake: number;
  date: Date;
  notes: string;
}

export interface WeightLogResponse {
  weight: string;
  weightUnit: string;
  caloriesIntake?: number;
  date: Date;
  rateChange?: number;
  logDate: Date;
}
