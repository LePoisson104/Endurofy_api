import { User, UsersInfo } from "./db.models";

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

export interface UserInfoServiceResponse {
  data: {
    userInfo: UsersInfo;
  };
}

// Food Service Interfaces
export interface FoodSearchServiceResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export interface FavoriteFoodServiceResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export interface CustomFoodServiceResponse {
  success: boolean;
  data?: any;
  message?: string;
}
