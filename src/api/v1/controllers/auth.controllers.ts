import { Request, Response, NextFunction } from "express";
import { controllerErrorResponse } from "../middlewares/error.handlers";
import { CustomError } from "../interfaces/error.interface";
import authServices from "../services/auth.services";
import {
  SignupRequest,
  LoginRequest,
  OTPRequest,
} from "../interfaces/auth.interfaces";
import { RequestHandler } from "express";
import { sendSuccess, sendCreated } from "../utils/response.utils";

const signup: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
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
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const verifyOTP: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.userId;
    const { email, otp } = req.body as OTPRequest;
    const result = await authServices.verifyOTP(userId, email, otp);
    sendCreated(res, null, result.message);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const resendOTP: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.userId;
    const { email } = req.body;
    const result = await authServices.resendOTP(userId, email);
    sendSuccess(res, null, result.message);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const forgotPassword: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    const result = await authServices.forgotPassword(email);
    sendSuccess(res, result.data);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const resetPassword: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const email = req.params.email;
    const otp = req.params.otp;
    const { password } = req.body;
    const result = await authServices.resetPassword(email, otp, password);
    sendSuccess(res, result.data);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const login: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body as LoginRequest;
    const result = await authServices.login(email, password, res);
    sendSuccess(res, result.data, "Login successful");
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const refresh: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authServices.refresh(req.cookies);
    sendSuccess(res, result.data, "Refresh successful");
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const logout: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    authServices.logout(req.cookies, res);
    sendSuccess(res, null, "Logged out successfully");
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

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
