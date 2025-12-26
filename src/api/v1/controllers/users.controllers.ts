import { NextFunction, Response } from "express";
import usersServices from "../services/users.services";
import { sendSuccess } from "../utils/response.utils";
import {
  UserCredentialsUpdatePayload,
  UserProfileUpdatePayload,
} from "../interfaces/user.interfaces";
import { asyncHandler } from "../utils/async-handler";
import { AuthenticatedRequest } from "../interfaces/request.interfaces";

const getUsersInfo = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const result = await usersServices.getUsersInfo(userId);
    sendSuccess(res, result.data.userInfo);
  }
);

const getUsersMacrosGoals = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const result = await usersServices.getUsersMacrosGoals(userId);
    sendSuccess(res, result.macrosGoals);
  }
);

const updateUsersName = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const userUpdatePayload: UserCredentialsUpdatePayload = req.body;
    const result = await usersServices.updateUsersName(
      userId,
      userUpdatePayload
    );
    sendSuccess(res, result.data.message);
  }
);

const updateUsersPassword = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const updatePasswordPayload: UserCredentialsUpdatePayload = req.body;
    const result = await usersServices.updateUsersPassword(
      userId,
      updatePasswordPayload
    );
    sendSuccess(res, result.data.message);
  }
);

const updateUsersEmail = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const updateEmailPayload: UserCredentialsUpdatePayload = req.body;
    const result = await usersServices.initiateEmailChange(
      userId,
      updateEmailPayload
    );
    sendSuccess(res, result.data.message);
  }
);

const verifyUpdateEmail = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const otp = req.body.otp;
    const result = await usersServices.verifyUpdateEmail(userId, otp);
    sendSuccess(res, result.data.message);
  }
);

const updateUsersProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const updateProfilePayload: UserProfileUpdatePayload = req.body;
    const result = await usersServices.updateUsersProfile(
      userId,
      updateProfilePayload
    );
    sendSuccess(res, result.data.message);
  }
);

const updateUsersProfileAndConvertWeightLogs = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const updateProfilePayload: UserProfileUpdatePayload = req.body;
    const result = await usersServices.updateUsersProfileAndConvertWeightLogs(
      userId,
      updateProfilePayload
    );
    sendSuccess(res, result.data.message);
  }
);

const updateUsersMacrosGoals = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const updateMacrosGoalsPayload = req.body;
    const result = await usersServices.updateUsersMacrosGoals(
      userId,
      updateMacrosGoalsPayload
    );
    sendSuccess(res, result.data.message);
  }
);
const deleteAccount = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const { email, password } = req.body;
    const result = await usersServices.deleteAccount(userId, email, password);
    sendSuccess(res, result.data.message);
  }
);

export default {
  getUsersInfo,
  getUsersMacrosGoals,
  updateUsersMacrosGoals,
  deleteAccount,
  updateUsersName,
  updateUsersPassword,
  updateUsersEmail,
  verifyUpdateEmail,
  updateUsersProfile,
  updateUsersProfileAndConvertWeightLogs,
};
