export type WaterUnit = "ml" | "floz";

export interface WaterLog {
  waterLogId: string;
  foodLogId: string;
  amount: number;
  unit: WaterUnit;
}

export interface AddWaterLogPayload {
  amount: number;
  unit: WaterUnit;
  loggedAt: string;
}

export interface UpdateWaterLogPayload {
  amount?: number;
  unit?: WaterUnit;
}
