import { v4 as uuidv4 } from "uuid";
import foodRepository from "../repositories/food.repositories";
import { AppError } from "../middlewares/error.handlers";
import pool from "../../../config/db.config";
import Logger from "../utils/logger";
import {
  AddFavoriteFoodPayload,
  GetCustomFoodPayload,
  CustomFoodRepository,
  CustomFoodPayload,
  BaseFood,
} from "../interfaces/food.interfaces";

//////////////////////////////////////////////////////////////////////////////////////////////
// @GET SERVICES - FAVORITE FOOD
//////////////////////////////////////////////////////////////////////////////////////////////
const getFavoriteFood = async (userId: string): Promise<BaseFood[]> => {
  if (!userId) {
    throw new AppError("UserId is required!", 400);
  }

  try {
    const getFavorites = await foodRepository.GetFavoriteFood(userId);

    const transformedFavorites: BaseFood[] = getFavorites.map(
      (favorite: any) => ({
        foodId: favorite.food_id,
        foodName: favorite.food_name,
        foodBrand: favorite.brand_name || "",
        ingredients: undefined,
        foodSource: favorite.food_source,
        calories: favorite.calories,
        protein: favorite.protein_g,
        carbs: favorite.carbs_g,
        fat: favorite.fat_g,
        fiber: favorite.fiber_g,
        sugar: favorite.sugar_g,
        sodium: favorite.sodium_mg,
        cholesterol: favorite.cholesterol_mg,
        servingSize: favorite.serving_size,
        servingSizeUnit: favorite.serving_size_unit,
        favoriteFoodId: favorite.favorite_food_id,
        isFavorite: true,
      })
    );
    return transformedFavorites;
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
    const isFavoriteFood = await foodRepository.GetIsFavoriteFood(
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

const getFavoriteStatusBatch = async (
  userId: string,
  foodIds: string[]
): Promise<{
  [foodId: string]: { favoriteFoodId: string | null; isFavorite: boolean };
}> => {
  if (!userId || !foodIds || foodIds.length === 0) {
    return {};
  }

  try {
    const favoriteResults = await foodRepository.GetFavoriteStatusBatch(
      userId,
      foodIds
    );

    // Create a map of foodId -> isFavorite
    const favoriteMap: {
      [foodId: string]: {
        favoriteFoodId: string | null;
        isFavorite: boolean;
      };
    } = {};

    // Initialize all as false
    foodIds.forEach((id) => {
      favoriteMap[id] = { favoriteFoodId: null, isFavorite: false };
    });

    // Set favorites to true
    favoriteResults.forEach((fav: any) => {
      favoriteMap[fav.food_id] = {
        favoriteFoodId: fav.favorite_food_id,
        isFavorite: true,
      };
    });

    return favoriteMap;
  } catch (error: any) {
    await Logger.logEvents(
      `Error in getFavoriteStatusBatch service: ${error.message}`,
      "errLog.log"
    );
    throw new AppError(
      "Something went wrong while checking favorite status!",
      500
    );
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @GET SERVICES - CUSTOM FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const getCustomFood = async (
  userId: string
): Promise<GetCustomFoodPayload[]> => {
  if (!userId) {
    throw new AppError("UserId is required!", 400);
  }

  const customFood = await foodRepository.GetCustomFood(userId);
  const transformedCustomFood = customFood.map(
    (food: CustomFoodRepository) => ({
      customFoodId: food.custom_food_id,
      description: food.food_name,
      brandOwner: food.brand_name,
      calories: food.calories,
      protein: food.protein_g,
      carbs: food.carbs_g,
      fat: food.fat_g,
      fiber: food.fiber_g,
      sugar: food.sugar_g,
      sodium: food.sodium_mg,
      cholesterol: food.cholesterol_mg,
      servingSize: food.serving_size,
      servingSizeUnit: food.serving_size_unit,
    })
  );

  return transformedCustomFood;
};

const getCustomFoodById = async (foodId: string): Promise<any[]> => {
  if (!foodId) {
    throw new AppError("FoodId is required!", 400);
  }

  try {
    const customFoodById = await foodRepository.GetCustomFoodById(foodId);
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

    const {
      foodId,
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
    } = foodPayload;

    const favFoodId = uuidv4();

    const addedFavoriteFood = await foodRepository.AddFavoriteFood(
      favFoodId,
      foodId,
      userId,
      foodName,
      foodBrand || null,
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
      servingUnit
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
  foodPayload: CustomFoodPayload
): Promise<{ data: { message: string } }> => {
  if (!userId || !foodPayload || Object.keys(foodPayload).length === 0) {
    throw new AppError("UserId and foodPayload are required!", 400);
  }

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

  await foodRepository.AddCustomFood(
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

  return {
    data: { message: "Custom food added successfully" },
  };
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @PATCH SERVICES - CUSTOM FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const updateCustomFood = async (
  customFoodId: string,
  updatePayload: CustomFoodPayload
): Promise<any> => {
  if (
    !customFoodId ||
    !updatePayload ||
    Object.keys(updatePayload).length === 0
  ) {
    throw new AppError("customFoodId and updatePayload are required!", 400);
  }

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
  } = updatePayload;

  // reason for not using ! is because protein, carbs, fat can contain 0, so we only need to check if the variables are undefined not when it's equal to 0
  if (
    foodName === undefined ||
    foodBrand === undefined ||
    calories === undefined ||
    protein === undefined ||
    carbs === undefined ||
    fat === undefined ||
    fiber === undefined ||
    sugar === undefined ||
    sodium === undefined ||
    cholesterol === undefined ||
    servingSize === undefined ||
    servingUnit === undefined
  ) {
    throw new AppError(
      "Make sure your variable names are spelled correctly (food_name, food_brand, calories, protein, carbs, fat, serving_size, serving_unit)",
      400
    );
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const updatedCustomFood = await foodRepository.UpdateCustomFood(
      customFoodId,
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

    const deletedFavoriteFood = await foodRepository.DeleteFavoriteFood(
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

    const deletedCustomFood = await foodRepository.DeleteCustomFood(
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
  getFavoriteStatusBatch,
  addFavoriteFood,
  deleteFavoriteFood,
  // Custom Food
  getCustomFood,
  getCustomFoodById,
  addCustomFood,
  updateCustomFood,
  deleteCustomFood,
};
