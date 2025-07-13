import { v4 as uuidv4 } from "uuid";
import foodLogRepository from "../repositories/food-log.repositories";
import { AppError } from "../middlewares/error.handlers";
import pool from "../../../config/db.config";
import Logger from "../utils/logger";
import {
  AddFoodPayload,
  AddFavoriteFoodPayload,
  AddCustomFoodPayload,
  UpdateFoodPayload,
  UpdateCustomFoodPayload,
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

const getFavoriteFood = async (userId: string): Promise<any[]> => {
  if (!userId) {
    throw new AppError("UserId is required!", 400);
  }

  try {
    const getFavorites = await foodLogRepository.queryGetFavoriteFood(userId);
    return getFavorites;
  } catch (error: any) {
    await Logger.logEvents(
      `Error in getFavoriteFood service: ${error.message}`,
      "errLog.log"
    );
    throw new AppError(
      "Something went wrong while trying to get favorite food!",
      500
    );
  }
};

const getIsFavoriteFood = async (
  userId: string,
  foodId: string
): Promise<{ isFavorite: boolean; data?: any }> => {
  if (!userId || !foodId) {
    throw new AppError("UserId and foodId are required!", 400);
  }

  try {
    const isFavoriteFood = await foodLogRepository.queryGetIsFavoriteFood(
      userId,
      foodId
    );

    if (isFavoriteFood.length === 0) {
      return { isFavorite: false };
    }

    return { isFavorite: true, data: isFavoriteFood };
  } catch (error: any) {
    await Logger.logEvents(
      `Error in getIsFavoriteFood service: ${error.message}`,
      "errLog.log"
    );
    throw new AppError(
      "Something went wrong while checking if food is favorite!",
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

const getCustomFood = async (userId: string): Promise<any[]> => {
  if (!userId) {
    throw new AppError("UserId is required!", 400);
  }

  try {
    const customFood = await foodLogRepository.queryGetCustomFood(userId);
    return customFood;
  } catch (error: any) {
    await Logger.logEvents(
      `Error in getCustomFood service: ${error.message}`,
      "errLog.log"
    );
    throw new AppError(
      "Something went wrong while trying to get custom food!",
      500
    );
  }
};

const getCustomFoodById = async (foodId: string): Promise<any[]> => {
  if (!foodId) {
    throw new AppError("FoodId is required!", 400);
  }

  try {
    const customFoodById = await foodLogRepository.queryGetCustomFoodById(
      foodId
    );
    return customFoodById;
  } catch (error: any) {
    await Logger.logEvents(
      `Error in getCustomFoodById service: ${error.message}`,
      "errLog.log"
    );
    throw new AppError(
      "Something went wrong while trying to get custom food by id!",
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

const addFavoriteFood = async (
  userId: string,
  foodPayload: AddFavoriteFoodPayload
): Promise<any> => {
  if (!userId || !foodPayload || Object.keys(foodPayload).length === 0) {
    throw new AppError("UserId and foodPayload are required!", 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { foodId, foodName, foodBrand, foodSource } = foodPayload;
    const favFoodId = uuidv4();

    const addedFavoriteFood = await foodLogRepository.queryAddFavoriteFood(
      favFoodId,
      foodId,
      userId,
      foodName,
      foodBrand,
      foodSource
    );

    await connection.commit();
    return addedFavoriteFood;
  } catch (error: any) {
    await connection.rollback();
    await Logger.logEvents(
      `Error in addFavoriteFood service: ${error.message}`,
      "errLog.log"
    );
    throw new AppError(
      "Something went wrong while trying to add favorite food!",
      500
    );
  } finally {
    connection.release();
  }
};

const addCustomFood = async (
  userId: string,
  foodPayload: AddCustomFoodPayload
): Promise<any> => {
  if (!userId || !foodPayload || Object.keys(foodPayload).length === 0) {
    throw new AppError("UserId and foodPayload are required!", 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      foodName,
      foodBrand,
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
    } = foodPayload;

    const customFoodId = uuidv4();

    const addedCustomFood = await foodLogRepository.queryAddCustomFood(
      customFoodId,
      userId,
      foodName,
      foodBrand,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
      cholesterol,
      servingSize,
      servingUnit
    );

    await connection.commit();
    return addedCustomFood;
  } catch (error: any) {
    await connection.rollback();
    await Logger.logEvents(
      `Error in addCustomFood service: ${error.message}`,
      "errLog.log"
    );
    throw new AppError(
      "Something went wrong while trying to add custom food!",
      500
    );
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

const updateCustomFood = async (
  customFoodId: string,
  updatePayload: UpdateCustomFoodPayload
): Promise<any> => {
  if (
    !customFoodId ||
    !updatePayload ||
    Object.keys(updatePayload).length === 0
  ) {
    throw new AppError("customFoodId and updatePayload are required!", 400);
  }

  const {
    food_name,
    food_brand,
    calories,
    protein,
    carbs,
    fat,
    serving_size,
    serving_unit,
  } = updatePayload;

  // reason for not using ! is because protein, carbs, fat can contain 0, so we only need to check if the variables are undefined not when it's equal to 0
  if (
    food_name === undefined ||
    food_brand === undefined ||
    calories === undefined ||
    protein === undefined ||
    carbs === undefined ||
    fat === undefined ||
    serving_size === undefined ||
    serving_unit === undefined
  ) {
    throw new AppError(
      "Make sure your variable names are spelled correctly (food_name, food_brand, calories, protein, carbs, fat, serving_size, serving_unit)",
      400
    );
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const updatedCustomFood = await foodLogRepository.queryUpdateCustomFood(
      customFoodId,
      updatePayload
    );

    await connection.commit();
    return updatedCustomFood;
  } catch (error: any) {
    await connection.rollback();
    await Logger.logEvents(
      `Error in updateCustomFood service: ${error.message}`,
      "errLog.log"
    );
    throw new AppError(
      "Something went wrong while trying to update custom food!",
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

const deleteFavoriteFood = async (favFoodId: string): Promise<any> => {
  if (!favFoodId) {
    throw new AppError("FavFoodId is required!", 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const deletedFavoriteFood = await foodLogRepository.queryDeleteFavoriteFood(
      favFoodId
    );

    await connection.commit();
    return deletedFavoriteFood;
  } catch (error: any) {
    await connection.rollback();
    await Logger.logEvents(
      `Error in deleteFavoriteFood service: ${error.message}`,
      "errLog.log"
    );
    throw new AppError(
      "Something went wrong while trying to delete favorite food!",
      500
    );
  } finally {
    connection.release();
  }
};

const deleteCustomFood = async (customFoodId: string): Promise<any> => {
  if (!customFoodId) {
    throw new AppError("customFoodId is required!", 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const deletedCustomFood = await foodLogRepository.queryDeleteCustomFood(
      customFoodId
    );

    await connection.commit();
    return deletedCustomFood;
  } catch (error: any) {
    await connection.rollback();
    await Logger.logEvents(
      `Error in deleteCustomFood service: ${error.message}`,
      "errLog.log"
    );
    throw new AppError(
      "Something went wrong while trying to delete custom food!",
      500
    );
  } finally {
    connection.release();
  }
};

export default {
  getFoodLogByDate,
  getFavoriteFood,
  getIsFavoriteFood,
  getLoggedDates,
  getCustomFood,
  getCustomFoodById,
  addFood,
  addFavoriteFood,
  addCustomFood,
  updateFood,
  updateCustomFood,
  deleteFood,
  deleteFavoriteFood,
  deleteCustomFood,
};
