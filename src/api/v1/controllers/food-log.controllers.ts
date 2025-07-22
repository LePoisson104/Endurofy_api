import { Request, Response, NextFunction, RequestHandler } from "express";
import {
  AppError,
  controllerErrorResponse,
} from "../middlewares/error.handlers";
import { CustomError } from "../interfaces/error.interface";
import { sendSuccess } from "../utils/response.utils";
import Logger from "../utils/logger";
import foodLogServices from "../services/food-log.services";

////////////////////////////////////////////////////////////////////////////////////////////////
// @GET CONTROLLERS
////////////////////////////////////////////////////////////////////////////////////////////////

const getAllFood: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.userId;
    const { date } = req.params;

    const foodLogs = await foodLogServices.getFoodLogByDate(userId, date);

    sendSuccess(res, {
      message: "Food logs retrieved successfully",
      data: foodLogs,
    });
  } catch (err: any) {
    await Logger.logEvents(
      `Error in getAllFood controller: ${err.message}`,
      "errLog.log"
    );
    await controllerErrorResponse(res, err as CustomError);
  }
};

const getLoggedDates: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
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
  } catch (err: any) {
    await Logger.logEvents(
      `Error in getLogDates controller: ${err.message}`,
      "errLog.log"
    );
    await controllerErrorResponse(res, err as CustomError);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @POST CONTROLLERS
////////////////////////////////////////////////////////////////////////////////////////////////

const addFood: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.userId;
    const foodPayload = req.body;

    const addedFood = await foodLogServices.addFood(userId, foodPayload);

    sendSuccess(res, {
      message: "Food added successfully",
      data: addedFood,
    });
  } catch (err: any) {
    await Logger.logEvents(
      `Error in addFood controller: ${err.message}`,
      "errLog.log"
    );
    await controllerErrorResponse(res, err as CustomError);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @PATCH CONTROLLERS
////////////////////////////////////////////////////////////////////////////////////////////////

const updateFood: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { foodId } = req.params;
    const updatePayload = req.body;

    const updatedFood = await foodLogServices.updateFood(foodId, updatePayload);

    sendSuccess(res, {
      message: "Food updated successfully",
      data: updatedFood,
    });
  } catch (err: any) {
    await Logger.logEvents(
      `Error in updateFood controller: ${err.message}`,
      "errLog.log"
    );
    await controllerErrorResponse(res, err as CustomError);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @DELETE CONTROLLERS
////////////////////////////////////////////////////////////////////////////////////////////////

const deleteFood: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { foodId } = req.params;

    const deletedFood = await foodLogServices.deleteFood(foodId);

    sendSuccess(res, {
      message: "Food deleted successfully",
      data: deletedFood,
    });
  } catch (err: any) {
    await Logger.logEvents(
      `Error in deleteFood controller: ${err.message}`,
      "errLog.log"
    );
    await controllerErrorResponse(res, err as CustomError);
  }
};

export default {
  getAllFood,
  getLoggedDates,
  addFood,
  updateFood,
  deleteFood,
};
