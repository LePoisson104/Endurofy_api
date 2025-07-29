import { Request, Response, NextFunction } from "express";
import { controllerErrorResponse } from "../middlewares/error.handlers";
import { CustomError } from "../interfaces/error.interface";
import authServices from "../services/auth.services";
import {
  SignupRequest,
  LoginRequest,
  OTPRequest,
} from "../interfaces/auth.interfaces";
import { sendSuccess, sendCreated } from "../utils/response.utils";
import { asyncHandler } from "../utils/async-handler";

const signup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, email, password } = req.body as SignupRequest;
    const result = await authServices.signup(
      firstName,
      lastName,
      email,
      password
    );
    sendSuccess(
      res,
      result.data,
      "Verification code has been sent to your email"
    );
  }
);

const verifyOTP = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId;
      const { email, otp } = req.body as OTPRequest;
      const result = await authServices.verifyOTP(userId, email, otp);
      sendCreated(res, null, result.message);
    } catch (err) {
      controllerErrorResponse(res, err as CustomError);
    }
  }
);

const resendOTP = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const { email } = req.body;
    const result = await authServices.resendOTP(userId, email);
    sendSuccess(res, null, result.message);
  }
);

const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const result = await authServices.forgotPassword(email);
    sendSuccess(res, result.data);
  }
);

const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const email = req.params.email;
    const otp = req.params.otp;
    const { password } = req.body;
    const result = await authServices.resetPassword(email, otp, password);
    sendSuccess(res, result.data);
  }
);

const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as LoginRequest;
    const result = await authServices.login(email, password, res);
    sendSuccess(res, result.data, "Login successful");
  }
);

const refresh = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await authServices.refresh(req.cookies);
    sendSuccess(res, result.data, "Refresh successful");
  }
);

const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    authServices.logout(req.cookies, res);
    sendSuccess(res, null, "Logged out successfully");
  }
);

export default {
  signup,
  login,
  refresh,
  logout,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
};
