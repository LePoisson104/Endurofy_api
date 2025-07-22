import { v4 as uuidv4 } from "uuid";
import foodLogRepository from "../repositories/food-log.repositories";
import { AppError } from "../middlewares/error.handlers";
import pool from "../../../config/db.config";
import Logger from "../utils/logger";
import {
  AddFoodPayload,
  UpdateFoodPayload,
} from "../interfaces/food-log.interfaces";

////////////////////////////////////////////////////////////////////////////////////////////////
// @GET SERVICES
////////////////////////////////////////////////////////////////////////////////////////////////
const getFoodLogByDate = async (
  userId: string,
  date: string
): Promise<any[]> => {
  if (!userId || !date) {
    throw new AppError("UserId and date are required!", 400);
  }

  try {
    const getAllFoods = await foodLogRepository.queryGetFoodLogByDate(
      userId,
      date
    );
    return getAllFoods;
  } catch (error: any) {
    await Logger.logEvents(
      `Error in getAllFood service: ${error.message}`,
      "errLog.log"
    );
    throw new AppError(
      "Something went wrong while trying to get all food logs!",
      500
    );
  }
};

const getLoggedDates = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<any[]> => {
  if (!userId || !startDate || !endDate) {
    throw new AppError("userId, startDate, and endDate are required!", 400);
  }

  try {
    const logDates = await foodLogRepository.queryGetLoggedDates(
      userId,
      startDate,
      endDate
    );
    return logDates;
  } catch (error: any) {
    await Logger.logEvents(
      `Error in getLogDates service: ${error.message}`,
      "errLog.log"
    );
    throw new AppError(
      "Something went wrong while trying to get log dates!",
      500
    );
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @POST SERVICES
////////////////////////////////////////////////////////////////////////////////////////////////
const addFood = async (
  userId: string,
  foodPayload: AddFoodPayload
): Promise<any> => {
  if (!userId || !foodPayload || Object.keys(foodPayload).length === 0) {
    throw new AppError("UserId and foodPayload are required!", 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      fdcId,
      foodName,
      foodBrand,
      foodSource,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
      cholesterol,
      servingSize,
      servingUnit,
      mealType,
      loggedAt,
    } = foodPayload;

    const foodLogId = uuidv4();
    const foodId = fdcId ? fdcId.toString() : uuidv4();

    const addedFood = await foodLogRepository.queryAddFood(
      foodLogId,
      userId,
      foodId,
      foodName,
      foodBrand,
      foodSource,
      mealType,
      servingSize,
      servingUnit,
      calories,
      protein,
      carbs,
      fat,
      loggedAt,
      fiber,
      sugar,
      sodium,
      cholesterol
    );

    await connection.commit();
    return addedFood;
  } catch (error: any) {
    await connection.rollback();
    await Logger.logEvents(
      `Error in addFood service: ${error.message}`,
      "errLog.log"
    );
    throw new AppError("Something went wrong while trying to add food!", 500);
  } finally {
    connection.release();
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @PATCH SERVICES
////////////////////////////////////////////////////////////////////////////////////////////////
const updateFood = async (
  foodId: string,
  updatePayload: UpdateFoodPayload
): Promise<any> => {
  if (!foodId || !updatePayload || Object.keys(updatePayload).length === 0) {
    throw new AppError("foodId and updatePayload are required!", 400);
  }

  const { serving_size, serving_unit } = updatePayload;

  if (!serving_size || !serving_unit) {
    throw new AppError(
      "Make sure variable names are spelled correctly (serving_size, serving_unit)",
      400
    );
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const updatedFood = await foodLogRepository.queryUpdateFood(
      foodId,
      updatePayload
    );

    await connection.commit();
    return updatedFood;
  } catch (error: any) {
    await connection.rollback();
    await Logger.logEvents(
      `Error in updateFood service: ${error.message}`,
      "errLog.log"
    );
    throw new AppError(
      "Something went wrong while trying to update food!",
      500
    );
  } finally {
    connection.release();
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @DELETE SERVICES
////////////////////////////////////////////////////////////////////////////////////////////////
const deleteFood = async (foodId: string): Promise<any> => {
  if (!foodId) {
    throw new AppError("FoodId is required!", 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const deletedFood = await foodLogRepository.queryDeleteFood(foodId);

    await connection.commit();
    return deletedFood;
  } catch (error: any) {
    await connection.rollback();
    await Logger.logEvents(
      `Error in deleteFood service: ${error.message}`,
      "errLog.log"
    );
    throw new AppError(
      "Something went wrong while trying to delete food!",
      500
    );
  } finally {
    connection.release();
  }
};

export default {
  getFoodLogByDate,
  getLoggedDates,
  addFood,
  updateFood,
  deleteFood,
};
