export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OTPRequest {
  email: string;
  otp: string;
}

export interface AuthResponse {
  status?: "pending" | "success";
  message: string;
  accessToken?: string;
}

export interface TokenPayload {
  UserInfo: {
    userId: string;
    email: string;
  };
}

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "none" | "lax" | "strict";
  domain: string;
  maxAge?: number;
}
