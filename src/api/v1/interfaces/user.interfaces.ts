import { Request } from "express";

export interface UserParamsRequest extends Request {
  params: {
    userId: string;
  };
}

export interface UserCredentialsUpdatePayload {
  firstName: string;
  lastName: string;
  email: string;
  newEmail: string;
  password: string;
  newPassword: string;
}

export interface UserProfileUpdatePayload {
  profile_status?: string;
  birth_date?: string;
  current_weight?: number;
  current_weight_unit?: string;
  starting_weight?: number;
  starting_weight_unit?: string;
  weight_goal?: number;
  weight_goal_unit?: string;
  height?: number;
  height_unit?: string;
  gender?: string;
  goal?: string;
  activity_level?: string;
  updated_at?: Date;
}

export interface MacrosGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  updated_at?: Date;
}
