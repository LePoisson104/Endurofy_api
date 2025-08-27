import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/response.utils";
import { asyncHandler } from "../utils/async-handler";
import waterLogServices from "../services/water-log.services";

const addWater = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { food_log_id, water_log_id, amount, unit } = req.body;

    const waterLog = await waterLogServices.addWater(
      food_log_id,
      water_log_id,
      amount,
      unit
    );

    sendSuccess(res, {
      message: "Water log retrieved successfully",
      waterLog: waterLog,
    });
  }
);

export default {
  addWater,
};
