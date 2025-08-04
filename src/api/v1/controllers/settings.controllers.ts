import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/response.utils";
import { asyncHandler } from "../utils/async-handler";
import settingsServices from "../services/settings.services";

const getSettings = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;

    const settings = await settingsServices.getSettings(userId);

    sendSuccess(res, {
      message: "Settings retrieved successfully",
      settings,
    });
  }
);

export default {
  getSettings,
};
