export interface User {
  user_id: string;
  email: string;
  hashed_password: string;
  first_name: string;
  last_name: string;
  verified: number;
  created_at?: Date;
  updated_at?: Date;
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
