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
      foodLog: foodLogs,
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
      logs: logDates,
    });
  }
);

const addFood = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const foodPayload = req.body;

    const addedFood = await foodLogServices.addFood(userId, foodPayload);

    sendSuccess(res, {
      message: addedFood.message,
    });
  }
);

const updateFood = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { foodId } = req.params;
    const updatePayload = req.body;

    const updatedFood = await foodLogServices.updateFood(foodId, updatePayload);

    sendSuccess(res, {
      message: updatedFood.message,
    });
  }
);

const deleteFood = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { foodId, foodLogId } = req.params;

    const deletedFood = await foodLogServices.deleteFood(foodId, foodLogId);

    sendSuccess(res, {
      message: deletedFood.message,
    });
  }
);

const deleteFoodLog = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { foodLogId } = req.params;

    const deletedFoodLog = await foodLogServices.deleteFoodLog(foodLogId);

    sendSuccess(res, {
      message: deletedFoodLog.message,
    });
  }
);

const markFoodLogAsComplete = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const foodLogId = req.params.foodLogId;
    const userId = req.params.userId;
    const { date, caloriesIntake, status } = req.body;

    const markedFoodLog = await foodLogServices.markFoodLogAsComplete(
      userId,
      foodLogId,
      date,
      caloriesIntake
    );

    sendSuccess(res, {
      message: markedFoodLog.message,
    });
  }
);

const markFoodLogAsIncomplete = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const foodLogId = req.params.foodLogId;

    const markedFoodLog = await foodLogServices.markFoodLogAsIncomplete(
      foodLogId
    );

    sendSuccess(res, {
      message: markedFoodLog.message,
    });
  }
);

export default {
  getAllFood,
  getLoggedDates,
  addFood,
  updateFood,
  deleteFood,
  deleteFoodLog,
  markFoodLogAsComplete,
  markFoodLogAsIncomplete,
};
