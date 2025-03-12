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
  birthDate: string;
  weight: number;
  weightUnit: string;
  weightGoal: number;
  weightGoalUnit: string;
  height: number;
  heightUnit: string;
  gender: string;
  goal: string;
  activityLevel: string;
}
