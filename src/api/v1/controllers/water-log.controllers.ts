import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/response.utils";
import { asyncHandler } from "../utils/async-handler";
import waterLogServices from "../services/water-log.services";
import { AuthenticatedRequest } from "../interfaces/request.interfaces";

const getWaterLogByDate = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const date = req.params.date;

    const waterLog = await waterLogServices.GetWaterLogByDate(userId, date);
    sendSuccess(res, {
      message: "Water log retrieved successfully",
      waterLog: waterLog,
    });
  }
);

const addWaterLog = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const date = req.params.date;
    const waterPaylaod = req.body;

    const addedWaterLog = await waterLogServices.addWaterLog(
      userId,
      date,
      waterPaylaod
    );

    sendSuccess(res, { message: addedWaterLog.message });
  }
);

const updateWaterLog = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const waterLogId = req.params.waterLogId;
    const foodLogId = req.params.foodLogId;
    const { amount } = req.body;

    const updatedWaterLog = await waterLogServices.updateWaterLog(
      userId,
      waterLogId,
      foodLogId,
      amount
    );
    sendSuccess(res, { message: updatedWaterLog.message });
  }
);

const deleteWaterLog = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const waterLogId = req.params.waterLogId;
    const foodLogId = req.params.foodLogId;

    const deletedWaterLog = await waterLogServices.deleteWaterLog(
      userId,
      waterLogId,
      foodLogId
    );
    sendSuccess(res, deletedWaterLog.message);
  }
);

export default {
  getWaterLogByDate,
  addWaterLog,
  updateWaterLog,
  deleteWaterLog,
};
