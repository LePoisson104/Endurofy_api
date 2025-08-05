import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/response.utils";
import foodLogServices from "../services/food-log.services";
import { asyncHandler } from "../utils/async-handler";

const getAllFood = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const { date } = req.params;

    const foodLogs = await foodLogServices.getFoodLogByDate(userId, date);

    sendSuccess(res, {
      message: "Food logs retrieved successfully",
      data: foodLogs,
    });
  }
);

const getLoggedDates = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const { startDate, endDate } = req.params;

    const logDates = await foodLogServices.getLoggedDates(
      userId,
      startDate,
      endDate
    );

    sendSuccess(res, {
      message: "Log dates retrieved successfully",
      data: logDates,
    });
  }
);

const addFood = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const foodPayload = req.body;

    const addedFood = await foodLogServices.addFood(userId, foodPayload);

    sendSuccess(res, {
      message: "Food added successfully",
      data: addedFood,
    });
  }
);

const updateFood = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { foodId } = req.params;
    const updatePayload = req.body;

    const updatedFood = await foodLogServices.updateFood(foodId, updatePayload);

    sendSuccess(res, {
      message: "Food updated successfully",
      data: updatedFood,
    });
  }
);

const deleteFood = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { foodId, foodLogId } = req.params;

    const deletedFood = await foodLogServices.deleteFood(foodId, foodLogId);

    sendSuccess(res, {
      message: "Food deleted successfully",
      data: deletedFood,
    });
  }
);

export default {
  getAllFood,
  getLoggedDates,
  addFood,
  updateFood,
  deleteFood,
};
