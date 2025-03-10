import { User } from "./db.models";

export interface AuthServiceResponse {
  success: boolean;
  data?: {
    user?: Partial<User>;
    accessToken?: string;
    refreshToken?: string;
  };
}

export interface OTPServiceResponse {
  success: boolean;
  message: string;
}

export interface TokenServiceResponse {
  accessToken: string;
}
