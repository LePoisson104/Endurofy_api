import { User, UsersInfo } from "./db.models";

export interface AuthServiceResponse {
  success: boolean;
  data?: {
    user?: Partial<User & { profile_status: string }>;
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

export interface UserInfoServiceResponse {
  data: {
    userInfo: UsersInfo;
  };
}
