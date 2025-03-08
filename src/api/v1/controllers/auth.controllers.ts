import { Request, Response } from "express";
import { controllerErrorResponse } from "../middlewares/error.handlers";
import { CustomError } from "../interfaces/error.interface";
import authServices from "../services/auth.services";

const signup = async (req: Request, res: Response): Promise<any> => {
  const { firstName, lastName, email, password } = req.body;
  try {
    await authServices.signup(firstName, lastName, email, password);
    return res.status(200).json({
      status: "pending",
      message: "Verification code has been sent to your email",
    });
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const verifyOTP = async (req: Request, res: Response): Promise<any> => {
  const { email, otp } = req.body;
  try {
    await authServices.verifyOTP(email, otp);
    return res.status(200).json({ message: "User created successfully!" });
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const resendOTP = async (req: Request, res: Response): Promise<any> => {
  const { email } = req.body;
  try {
    await authServices.resendOTP(email);
    return res.status(200).json({
      message: "Verification code has been sent, please check your email",
    });
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const login = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;
  try {
    const result = await authServices.login(email, password, res);
    return res.status(200).json(result);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const refresh = async (req: Request, res: Response): Promise<any> => {
  const cookies = req.cookies;

  try {
    const accessToken = await authServices.refresh(cookies);
    return res.status(200).json(accessToken);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const logout = async (req: Request, res: Response): Promise<any> => {
  const cookies = req.cookies;
  try {
    authServices.logout(cookies, res);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

export default { signup, login, refresh, logout, verifyOTP, resendOTP };
