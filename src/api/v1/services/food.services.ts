import { v4 as uuidv4 } from "uuid";
import foodRepository from "../repositories/food.repositories";
import { AppError } from "../middlewares/error.handlers";
import pool from "../../../config/db.config";
import Logger from "../utils/logger";
import {
  AddFavoriteFoodPayload,
  AddCustomFoodPayload,
  UpdateCustomFoodPayload,
} from "../interfaces/food.interfaces";

////////////////////////////////////////////////////////////////////////////////////////////////
// @GET SERVICES - FAVORITE FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const getFavoriteFood = async (userId: string): Promise<any[]> => {
  if (!userId) {
    throw new AppError("UserId is required!", 400);
  }

  try {
    const getFavorites = await foodRepository.queryGetFavoriteFood(userId);
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
    const isFavoriteFood = await foodRepository.queryGetIsFavoriteFood(
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

////////////////////////////////////////////////////////////////////////////////////////////////
// @GET SERVICES - CUSTOM FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const getCustomFood = async (userId: string): Promise<any[]> => {
  if (!userId) {
    throw new AppError("UserId is required!", 400);
  }

  try {
    const customFood = await foodRepository.queryGetCustomFood(userId);
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
    const customFoodById = await foodRepository.queryGetCustomFoodById(foodId);
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
// @POST SERVICES - FAVORITE FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
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

    const addedFavoriteFood = await foodRepository.queryAddFavoriteFood(
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

////////////////////////////////////////////////////////////////////////////////////////////////
// @POST SERVICES - CUSTOM FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
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

    const addedCustomFood = await foodRepository.queryAddCustomFood(
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
// @PATCH SERVICES - CUSTOM FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
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

    const updatedCustomFood = await foodRepository.queryUpdateCustomFood(
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
// @DELETE SERVICES - FAVORITE FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const deleteFavoriteFood = async (favFoodId: string): Promise<any> => {
  if (!favFoodId) {
    throw new AppError("FavFoodId is required!", 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const deletedFavoriteFood = await foodRepository.queryDeleteFavoriteFood(
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

////////////////////////////////////////////////////////////////////////////////////////////////
// @DELETE SERVICES - CUSTOM FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const deleteCustomFood = async (customFoodId: string): Promise<any> => {
  if (!customFoodId) {
    throw new AppError("customFoodId is required!", 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const deletedCustomFood = await foodRepository.queryDeleteCustomFood(
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
  // Favorite Food
  getFavoriteFood,
  getIsFavoriteFood,
  addFavoriteFood,
  deleteFavoriteFood,
  // Custom Food
  getCustomFood,
  getCustomFoodById,
  addCustomFood,
  updateCustomFood,
  deleteCustomFood,
};
