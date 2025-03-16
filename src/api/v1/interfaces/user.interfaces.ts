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
  weight?: number;
  weight_unit?: string;
  weight_goal?: number;
  weight_goal_unit?: string;
  target_calories?: number;
  height?: number;
  height_unit?: string;
  gender?: string;
  goal?: string;
  activity_level?: string;
  BMR?: number;
  updated_at?: Date;
}
