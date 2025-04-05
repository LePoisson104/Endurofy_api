export interface User {
  user_id: string;
  email: string;
  hashed_password: string;
  first_name: string;
  last_name: string;
  verified: number;
  created_at?: Date;
  updated_at?: Date;
  pending_email?: string;
}

export interface UserProfile {
  profile_status: string;
  birth_date: string;
  current_weight: number;
  current_weight_unit: string;
  starting_weight: number;
  starting_weight_unit: string;
  weight_goal: number;
  weight_goal_unit: string;
  height: number;
  height_unit: string;
  gender: string;
  goal: string;
  activity_level: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface UsersInfo {
  email: string;
  first_name: string;
  last_name: string;
  profile_status: string;
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
  user_updated_at?: string;
  user_profile_updated_at?: string;
}

export interface OTP {
  email: string;
  hashed_otp: string;
  created_at: string;
  expires_at: string;
}

// Database error codes that can be reused across repositories
export const DB_ERROR_CODES = {
  DUPLICATE_ENTRY: "ER_DUP_ENTRY",
} as const;
