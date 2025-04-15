import { NextFunction, Request, Response } from "express";
import { controllerErrorResponse } from "../middlewares/error.handlers";
import { CustomError } from "../interfaces/error.interface";
import usersServices from "../services/users.services";
import { sendSuccess } from "../utils/response.utils";
import {
  UserCredentialsUpdatePayload,
  UserProfileUpdatePayload,
} from "../interfaces/user.interfaces";

const getUsersInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId;
  try {
    const result = await usersServices.getUsersInfo(userId);
    sendSuccess(res, result.data.userInfo);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

// update name, email, password
const updateUsersName = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId;
  const userUpdatePayload: UserCredentialsUpdatePayload = req.body;
  try {
    const result = await usersServices.updateUsersName(
      userId,
      userUpdatePayload
    );
    sendSuccess(res, result.data.message);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const updateUsersPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId;
  const updatePasswordPayload: UserCredentialsUpdatePayload = req.body;
  try {
    const result = await usersServices.updateUsersPassword(
      userId,
      updatePasswordPayload
    );
    sendSuccess(res, result.data.message);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const updateUsersEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId;
  const updateEmailPayload: UserCredentialsUpdatePayload = req.body;
  try {
    const result = await usersServices.initiateEmailChange(
      userId,
      updateEmailPayload
    );
    sendSuccess(res, result.data.message);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const verifyUpdateEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId;
  const otp = req.body.otp;
  try {
    const result = await usersServices.verifyUpdateEmail(userId, otp);
    sendSuccess(res, result.data.message);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const updateUsersProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId;
  const updateProfilePayload: UserProfileUpdatePayload = req.body;

  try {
    const result = await usersServices.updateUsersProfile(
      userId,
      updateProfilePayload
    );
    sendSuccess(res, result.data.message);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const updateUsersProfileAndConvertWeightLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId;
  const updateProfilePayload: UserProfileUpdatePayload = req.body;

  try {
    const result = await usersServices.updateUsersProfileAndConvertWeightLogs(
      userId,
      updateProfilePayload
    );
    sendSuccess(res, result.data.message);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId;
  const { email, password } = req.body;
  try {
    const result = await usersServices.deleteAccount(userId, email, password);
    sendSuccess(res, result.data.message);
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

export default {
  getUsersInfo,
  deleteAccount,
  updateUsersName,
  updateUsersPassword,
  updateUsersEmail,
  verifyUpdateEmail,
  updateUsersProfile,
  updateUsersProfileAndConvertWeightLogs,
};
